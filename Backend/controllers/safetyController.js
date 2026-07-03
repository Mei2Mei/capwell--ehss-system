const safetyModel = require('../models/safetyModel');
const logAudit = require('../utils/audit');

const getSafetyRecords = async (req, res) => {
  try {
    const records = await safetyModel.getAllSafetyRecords();
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getSafetyRecord = async (req, res) => {
  try {
    const record = await safetyModel.getSafetyRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createRecord = async (req, res) => {
  try {
    const record = await safetyModel.createSafetyRecord(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'safety_metrics', recordId: record.id, newValue: record, ip: req.ip });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRecord = async (req, res) => {
  try {
    const record = await safetyModel.updateSafetyRecord(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'safety_metrics', recordId: record.id, newValue: record, ip: req.ip });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRecord = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await safetyModel.deleteSafetyRecord(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'safety_metrics', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getSafetyRecords, getSafetyRecord, createRecord, updateRecord, deleteRecord };