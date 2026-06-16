const ppeModel = require('../models/ppeModel');

const getPPEItems = async (req, res) => {
  try {
    const items = await ppeModel.getAllPPEItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPPEItem = async (req, res) => {
  try {
    const item = await ppeModel.getPPEItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { ppe_item_id, requested_by, quantity, notes } = req.body;
    const request = await ppeModel.createPPERequest(ppe_item_id, requested_by, quantity, notes);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approve = async (req, res) => {
  try {
    const { approved_by } = req.body;
    const request = await ppeModel.approveRequest(req.params.id, approved_by);
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reject = async (req, res) => {
  try {
    const { approved_by } = req.body;
    const request = await ppeModel.rejectRequest(req.params.id, approved_by);
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const fulfill = async (req, res) => {
  try {
    const { fulfilled_by } = req.body;
    const request = await ppeModel.fulfillRequest(req.params.id, fulfilled_by);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await ppeModel.getAllRequests();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPPEItems, getPPEItem,
  createRequest, approve, reject, fulfill, getRequests
};