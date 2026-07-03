const sustainabilityModel = require('../models/sustainabilityModel');
const logAudit = require('../utils/audit');

const getSustainabilityRecords = async (req, res) => {
  try {
    const records = await sustainabilityModel.getAllSustainabilityRecords();
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getSustainabilityRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.getSustainabilityRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getEmissionFactors = async (req, res) => {
  try {
    const factors = await sustainabilityModel.getEmissionFactors();
    res.json(factors);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.createSustainabilityRecord(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'sustainability', recordId: record.id, newValue: record, ip: req.ip });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.updateSustainabilityRecord(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'sustainability', recordId: record.id, newValue: record, ip: req.ip });
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRecord = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await sustainabilityModel.deleteSustainabilityRecord(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'sustainability', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getSustainabilityRecords, getSustainabilityRecord, getEmissionFactors, createRecord, updateRecord, deleteRecord };