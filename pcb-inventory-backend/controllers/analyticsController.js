// controllers/analyticsController.js
const pool = require('../config/db');

const getLowStock = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, part_number, current_stock, monthly_required_quantity,
        ROUND((0.2 * monthly_required_quantity)::numeric, 0) AS threshold,
        ROUND(
          CASE WHEN monthly_required_quantity > 0
            THEN (current_stock::numeric / monthly_required_quantity * 100)
            ELSE 0
          END, 2
        ) AS stock_percentage
      FROM components
      WHERE current_stock < (0.2 * monthly_required_quantity)
      ORDER BY stock_percentage ASC
    `);

    res.status(200).json({
      message: 'Low stock components fetched successfully',
      count: result.rows.length,
      components: result.rows
    });
  } catch (error) {
    console.error('Error fetching low stock:', error);
    res.status(500).json({ error: 'Failed to fetch low stock components', details: error.message });
  }
};

const getTopConsumed = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.part_number, c.current_stock,
        COALESCE(SUM(ch.quantity_used), 0) AS total_consumed
      FROM components c
      LEFT JOIN consumption_history ch ON c.id = ch.component_id
      GROUP BY c.id, c.name, c.part_number, c.current_stock
      ORDER BY total_consumed DESC
    `);

    res.status(200).json({
      message: 'Top consumed components fetched successfully',
      count: result.rows.length,
      components: result.rows
    });
  } catch (error) {
    console.error('Error fetching top consumed:', error);
    res.status(500).json({ error: 'Failed to fetch top consumed components', details: error.message });
  }
};

const getConsumptionSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id AS component_id, c.name, c.part_number,
        c.current_stock, c.monthly_required_quantity,
        COALESCE(SUM(ch.quantity_used), 0) AS total_consumed,
        COUNT(ch.id) AS consumption_count,
        MAX(ch.used_at) AS last_consumed_at,
        json_agg(
          json_build_object(
            'pcb_id', p.id,
            'pcb_name', p.pcb_name,
            'quantity_used', ch.quantity_used,
            'used_at', ch.used_at
          ) ORDER BY ch.used_at DESC
        ) FILTER (WHERE ch.id IS NOT NULL) AS consumption_details
      FROM components c
      LEFT JOIN consumption_history ch ON c.id = ch.component_id
      LEFT JOIN pcbs p ON ch.pcb_id = p.id
      GROUP BY c.id, c.name, c.part_number, c.current_stock, c.monthly_required_quantity
      ORDER BY total_consumed DESC
    `);

    res.status(200).json({
      message: 'Consumption summary fetched successfully',
      count: result.rows.length,
      components: result.rows
    });
  } catch (error) {
    console.error('Error fetching consumption summary:', error);
    res.status(500).json({ error: 'Failed to fetch consumption summary', details: error.message });
  }
};

module.exports = {
  getLowStock,
  getTopConsumed,
  getConsumptionSummary
};
