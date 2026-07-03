const costsModel = require('../models/costsModel');
const logAudit = require('../utils/audit');

const getCostRecords = async (req, res) => {
  try {
    const records = await costsModel.getAllCostRecords();
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCostRecord = async (req, res) => {
  try {
    const record = await costsModel.getCostRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createRecord = async (req, res) => {
  try {
    const record = await costsModel.createCostRecord(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'departmental_costs', recordId: record.id, newValue: record, ip: req.ip });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRecord = async (req, res) => {
  try {
    const record = await costsModel.updateCostRecord(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'departmental_costs', recordId: record.id, newValue: record, ip: req.ip });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRecord = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await costsModel.deleteCostRecord(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'departmental_costs', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getCostRecords, getCostRecord, createRecord, updateRecord, deleteRecord };