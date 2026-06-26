const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ppeMatrixController');

router.get('/', ctrl.getMatrix);
router.post('/cell', ctrl.updateCell);
router.post('/department', ctrl.addDepartment);
router.post('/item', ctrl.addPPEItem);
router.delete('/department/:department', ctrl.deleteDepartment);
router.delete('/item/:item', ctrl.deletePPEItem);

module.exports = router;