const complianceModel = require('../models/complianceModel');
const logAudit = require('../utils/audit');

const getComplianceItems = async (req, res) => {
  try {
    const items = await complianceModel.getAllComplianceItems();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getComplianceItem = async (req, res) => {
  try {
    const item = await complianceModel.getComplianceItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createItem = async (req, res) => {
  try {
    const item = await complianceModel.createComplianceItem(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'compliance_matrix', recordId: item.id, newValue: item, ip: req.ip });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateItem = async (req, res) => {
  try {
    const item = await complianceModel.updateComplianceItem(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'compliance_matrix', recordId: item.id, newValue: item, ip: req.ip });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteItem = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await complianceModel.deleteComplianceItem(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'compliance_matrix', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getComplianceItems, getComplianceItem, createItem, updateItem, deleteItem };