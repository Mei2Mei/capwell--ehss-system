const sustainabilityModel = require('../models/sustainabilityModel');

const getSustainabilityRecords = async (req, res) => {
  try {
    const records = await sustainabilityModel.getAllSustainabilityRecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSustainabilityRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.getSustainabilityRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmissionFactors = async (req, res) => {
  try {
    const factors = await sustainabilityModel.getEmissionFactors();
    res.json(factors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.createSustainabilityRecord(req.body);
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRecord = async (req, res) => {
  try {
    const record = await sustainabilityModel.updateSustainabilityRecord(req.params.id, req.body);
    res.json(record);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRecord = async (req, res) => {
  try {
    await sustainabilityModel.deleteSustainabilityRecord(req.params.id);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getSustainabilityRecords, getSustainabilityRecord, getEmissionFactors, createRecord, updateRecord, deleteRecord };