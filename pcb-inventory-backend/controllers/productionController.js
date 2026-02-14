// controllers/productionController.js
const pool = require('../config/db');

const addProduction = async (req, res) => {
  const client = await pool.connect();

  try {
    const { pcb_id, quantity_produced } = req.body;

    if (!pcb_id || !quantity_produced) {
      return res.status(400).json({ error: 'pcb_id and quantity_produced are required.' });
    }

    if (quantity_produced <= 0) {
      return res.status(400).json({ error: 'quantity_produced must be greater than 0.' });
    }

    // Verify PCB exists
    const pcbCheck = await client.query('SELECT id, pcb_name FROM pcbs WHERE id = $1', [pcb_id]);
    if (pcbCheck.rows.length === 0) {
      return res.status(404).json({ error: 'PCB not found.' });
    }

    await client.query('BEGIN');

    // Step 1: Fetch BOM for this PCB
    const bomResult = await client.query(
      `SELECT pc.component_id, pc.quantity_required, c.name, c.part_number, c.current_stock, c.monthly_required_quantity
       FROM pcb_components pc
       JOIN components c ON pc.component_id = c.id
       WHERE pc.pcb_id = $1`,
      [pcb_id]
    );

    if (bomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No BOM found for this PCB. Import BOM first.' });
    }

    // Step 2 & 3: Calculate required and check stock availability
    const insufficientComponents = [];
    const consumptionPlan = [];

    for (const bom of bomResult.rows) {
      const required = bom.quantity_required * quantity_produced;

      if (bom.current_stock < required) {
        insufficientComponents.push({
          component: bom.name,
          part_number: bom.part_number,
          available: bom.current_stock,
          required: required,
          shortage: required - bom.current_stock
        });
      }

      consumptionPlan.push({
        component_id: bom.component_id,
        required: required,
        monthly_required_quantity: bom.monthly_required_quantity
      });
    }

    // If any component has insufficient stock → abort
    if (insufficientComponents.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Insufficient stock for production.',
        insufficientComponents
      });
    }

    // Step 4: Deduct stock from components
    for (const item of consumptionPlan) {
      await client.query(
        'UPDATE components SET current_stock = current_stock - $1 WHERE id = $2',
        [item.required, item.component_id]
      );
    }

    // Step 5: Insert into production_entries
    await client.query(
      'INSERT INTO production_entries (pcb_id, quantity_produced) VALUES ($1, $2)',
      [pcb_id, quantity_produced]
    );

    // Step 6: Insert into consumption_history
    for (const item of consumptionPlan) {
      await client.query(
        'INSERT INTO consumption_history (component_id, pcb_id, quantity_used) VALUES ($1, $2, $3)',
        [item.component_id, pcb_id, item.required]
      );
    }

    // Step 7: Check procurement trigger condition
    // IF current_stock < (0.2 * monthly_required_quantity) AND no OPEN trigger exists → insert trigger
    for (const item of consumptionPlan) {
      const stockResult = await client.query(
        'SELECT current_stock, monthly_required_quantity FROM components WHERE id = $1',
        [item.component_id]
      );

      if (stockResult.rows.length > 0) {
        const { current_stock, monthly_required_quantity } = stockResult.rows[0];
        const threshold = 0.2 * monthly_required_quantity;

        if (current_stock < threshold) {
          // Check if OPEN trigger already exists
          const triggerCheck = await client.query(
            "SELECT id FROM procurement_triggers WHERE component_id = $1 AND status = 'OPEN'",
            [item.component_id]
          );

          if (triggerCheck.rows.length === 0) {
            await client.query(
              'INSERT INTO procurement_triggers (component_id) VALUES ($1)',
              [item.component_id]
            );
          }
        }
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Production recorded successfully',
      pcb: pcbCheck.rows[0].pcb_name,
      quantity_produced,
      components_consumed: consumptionPlan.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording production:', error);
    res.status(500).json({ error: 'Failed to record production', details: error.message });
  } finally {
    client.release();
  }
};

module.exports = { addProduction };
