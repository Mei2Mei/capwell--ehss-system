const actionTrackerModel = require('../models/actionTrackerModel');
const logAudit = require('../utils/audit');

const getActions = async (req, res) => {
  try {
    const actions = await actionTrackerModel.getAllActions();
    res.json(actions);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAction = async (req, res) => {
  try {
    const action = await actionTrackerModel.getActionById(req.params.id);
    if (!action) return res.status(404).json({ error: 'Action not found' });
    res.json(action);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createActionItem = async (req, res) => {
  try {
    const item = await actionTrackerModel.createAction(req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'CREATE', tableName: 'action_tracker', recordId: item.id, newValue: item, ip: req.ip });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateActionItem = async (req, res) => {
  try {
    const item = await actionTrackerModel.updateAction(req.params.id, req.body);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'UPDATE', tableName: 'action_tracker', recordId: item.id, newValue: item, ip: req.ip });
    res.json(item);
  } catch (err) { 
  console.error('UPDATE ACTION ERROR:', err.message);
  res.status(500).json({ error: err.message }); 
}
};

const deleteActionItem = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Deletion reason is required.' });
    const deleted = await actionTrackerModel.deleteAction(req.params.id, reason);
    await logAudit({ userId: req.user?.id, userName: req.user?.full_name, action: 'DELETE', tableName: 'action_tracker', recordId: deleted.id, ip: req.ip });
    res.json(deleted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getActions, getAction, createActionItem, updateActionItem, deleteActionItem };