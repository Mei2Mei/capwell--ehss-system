const ppeMatrixModel = require('../models/ppeMatrixModel');

const getMatrix = async (req, res) => {
  try {
    const [matrix, departments, ppeItems] = await Promise.all([
      ppeMatrixModel.getMatrix(),
      ppeMatrixModel.getDepartments(),
      ppeMatrixModel.getPPEItems(),
    ]);
    res.json({ matrix, departments, ppeItems });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateCell = async (req, res) => {
  try {
    const { department, ppe_item, requirement } = req.body;
    const cell = await ppeMatrixModel.upsertCell(department, ppe_item, requirement);
    res.json(cell);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    await ppeMatrixModel.addDepartment(department);
    res.json({ department });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addPPEItem = async (req, res) => {
  try {
    const { ppe_item } = req.body;
    await ppeMatrixModel.addPPEItem(ppe_item);
    res.json({ ppe_item });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteDepartment = async (req, res) => {
  try {
    await ppeMatrixModel.deleteDepartment(req.params.department);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deletePPEItem = async (req, res) => {
  try {
    await ppeMatrixModel.deletePPEItem(req.params.item);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getMatrix, updateCell, addDepartment, addPPEItem, deleteDepartment, deletePPEItem };