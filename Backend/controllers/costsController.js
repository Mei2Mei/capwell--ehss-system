const costsModel = require('../models/costsModel');

const getCostRecords = async (req, res) => {
  try {
    const records = await costsModel.getAllCostRecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCostRecord = async (req, res) => {
  try {
    const record = await costsModel.getCostRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const record = await costsModel.createCostRecord(req.body);
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRecord = async (req, res) => {
  try {
    const record = await costsModel.updateCostRecord(req.params.id, req.body);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRecord = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await costsModel.deleteCostRecord(req.params.id, reason);
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getCostRecords, getCostRecord, createRecord, updateRecord, deleteRecord };