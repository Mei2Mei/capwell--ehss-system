const equipmentModel = require('../models/equipmentModel');
const logAudit = require('../utils/audit');

const getEquipmentList = async (req, res) => {
  try {
    const items = await equipmentModel.getAllEquipment();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getEquipmentItem = async (req, res) => {
  try {
    const item = await equipmentModel.getEquipmentById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createEquipmentItem = async (req, res) => {
  try {
    const item = await equipmentModel.createEquipment(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'equipment', recordId: item.id, newValue: item, ip: req.ip });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateEquipmentItem = async (req, res) => {
  try {
    const item = await equipmentModel.updateEquipment(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'equipment', recordId: item.id, newValue: item, ip: req.ip });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteEquipmentItem = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await equipmentModel.deleteEquipment(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'equipment', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getEquipmentList, getEquipmentItem, createEquipmentItem, updateEquipmentItem, deleteEquipmentItem };