const pool = require('../config/db');

const getReportsSummary = async () => {
  const safety = await pool.query('SELECT * FROM safety_records ORDER BY period');
  const costs = await pool.query('SELECT * FROM cost_records ORDER BY date');
  const compliance = await pool.query('SELECT * FROM compliance_items ORDER BY id');
  const ppe = await pool.query('SELECT * FROM ppe_items ORDER BY id');

  const totalCosts = costs.rows.reduce((sum, r) => sum + Number(r.cost_excl_vat), 0);
  const totalLTI = safety.rows.reduce((sum, r) => sum + Number(r.lost_time_incidents), 0);
  const totalWorkedHours = safety.rows.reduce((sum, r) => sum + Number(r.worked_hours), 0);
  const lowStockPPE = ppe.rows.filter(item => item.current_stock <= item.reorder_level).length;
  const expiredCompliance = compliance.rows.filter(item => item.date_of_expiry && new Date(item.date_of_expiry) < new Date()).length;

  return {
    raw: {
      safety: safety.rows,
      costs: costs.rows,
      compliance: compliance.rows,
      ppe: ppe.rows,
    },
    summary: {
      total_costs: totalCosts,
      total_lost_time_incidents: totalLTI,
      total_worked_hours: totalWorkedHours,
      low_stock_ppe_count: lowStockPPE,
      expired_compliance_count: expiredCompliance,
    },
  };
};

module.exports = { getReportsSummary };