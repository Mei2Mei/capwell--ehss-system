const reportsModel = require('../models/reportsModel');

const getReports = async (req, res) => {
  try {
    const data = await reportsModel.getReportsSummary();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getReports };