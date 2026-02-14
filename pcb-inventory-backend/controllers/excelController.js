// controllers/excelController.js
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const fs = require('fs');

/**
 * POST /excel/import-components
 * Accepts .xlsx file, parses rows, upserts into components table.
 * Returns { inserted, updated }
 */
const importComponents = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ error: 'No worksheet found in Excel file' });
    }

    await client.query('BEGIN');

    let inserted = 0;
    let updated = 0;

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const componentName = row.getCell(1).value;
      const partNumber = row.getCell(2).value;
      const currentStock = row.getCell(3).value;
      const monthlyRequired = row.getCell(4).value;

      // Skip empty rows
      if (!componentName && !partNumber && !currentStock && !monthlyRequired) {
        continue;
      }

      // Part number is required
      if (!partNumber) {
        continue;
      }

      const partNumberStr = String(partNumber).trim();

      // Check if component already exists
      const checkResult = await client.query(
        'SELECT id FROM components WHERE part_number = $1',
        [partNumberStr]
      );

      if (checkResult.rows.length > 0) {
        // Update existing component
        await client.query(
          `UPDATE components 
           SET name = $1, current_stock = $2, monthly_required_quantity = $3 
           WHERE part_number = $4`,
          [
            componentName ? String(componentName).trim() : '',
            parseInt(currentStock, 10) || 0,
            parseInt(monthlyRequired, 10) || 0,
            partNumberStr
          ]
        );
        updated++;
      } else {
        // Insert new component
        await client.query(
          `INSERT INTO components (name, part_number, current_stock, monthly_required_quantity) 
           VALUES ($1, $2, $3, $4)`,
          [
            componentName ? String(componentName).trim() : '',
            partNumberStr,
            parseInt(currentStock, 10) || 0,
            parseInt(monthlyRequired, 10) || 0
          ]
        );
        inserted++;
      }
    }

    await client.query('COMMIT');

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({
      message: 'Components imported successfully',
      inserted,
      updated,
      total: inserted + updated
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing components:', error);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ error: 'Failed to import components', details: error.message });
  } finally {
    client.release();
  }
};

/**
 * POST /excel/import-bom
 * Accepts .xlsx file, reads "Master_Summary" sheet.
 * Maps: PCB Name = "Bajaj PCB", Part Number = "Spare Part Code", Quantity = "Count"
 * Returns { mappingsInserted }
 */
const importBOM = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    // Load the first worksheet in the file
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ error: 'No worksheet found in Excel file.' });
    }

    // Read header row to find column indices dynamically
    const headerRow = worksheet.getRow(1);
    let sparePartCodeCol = null;
    let countCol = null;

    headerRow.eachCell((cell, colNumber) => {
      const headerValue = String(cell.value || '').trim().toLowerCase();
      if (headerValue === 'spare part code') {
        sparePartCodeCol = colNumber;
      } else if (headerValue === 'count') {
        countCol = colNumber;
      }
    });

    if (!sparePartCodeCol || !countCol) {
      return res.status(400).json({
        error: 'Required columns "Spare Part Code" and/or "Count" not found in header row.'
      });
    }

    await client.query('BEGIN');

    const pcbName = 'Bajaj PCB';
    let mappingsInserted = 0;

    // Step 1: Find or create the PCB
    let pcbId;
    const pcbResult = await client.query(
      'SELECT id FROM pcbs WHERE pcb_name = $1',
      [pcbName]
    );

    if (pcbResult.rows.length > 0) {
      pcbId = pcbResult.rows[0].id;
    } else {
      const insertPcbResult = await client.query(
        'INSERT INTO pcbs (pcb_name) VALUES ($1) RETURNING id',
        [pcbName]
      );
      pcbId = insertPcbResult.rows[0].id;
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const partNumber = row.getCell(sparePartCodeCol).value;
      const quantityRequired = row.getCell(countCol).value;

      // Skip rows where part number is missing
      if (!partNumber) {
        continue;
      }

      // Skip rows where Count is empty or 0
      const qty = parseInt(quantityRequired, 10);
      if (!qty || qty <= 0) {
        continue;
      }

      const partNumberStr = String(partNumber).trim();

      // Step 2: Find component by part_number, or create it if not found
      const componentResult = await client.query(
        'SELECT id FROM components WHERE part_number = $1',
        [partNumberStr]
      );

      let componentId;
      if (componentResult.rows.length === 0) {
        // Auto-create component with default values
        const insertComponentResult = await client.query(
          `INSERT INTO components (name, part_number, current_stock, monthly_required_quantity)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [partNumberStr, partNumberStr, 1000, 500]
        );
        componentId = insertComponentResult.rows[0].id;
      } else {
        componentId = componentResult.rows[0].id;
      }

      // Step 3: Check for duplicate mapping
      const duplicateCheck = await client.query(
        'SELECT id FROM pcb_components WHERE pcb_id = $1 AND component_id = $2',
        [pcbId, componentId]
      );

      // If mapping already exists → skip
      if (duplicateCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO pcb_components (pcb_id, component_id, quantity_required) VALUES ($1, $2, $3)',
          [pcbId, componentId, qty]
        );
        mappingsInserted++;
      }
    }

    await client.query('COMMIT');

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({
      message: 'BOM imported successfully',
      pcbName,
      mappingsInserted
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing BOM:', error);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ error: 'Failed to import BOM', details: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  importComponents,
  importBOM
};