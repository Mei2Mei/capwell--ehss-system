const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');

router.get('/', equipmentController.getEquipmentList);
router.get('/:id', equipmentController.getEquipmentItem);
router.post('/', equipmentController.createEquipmentItem);
router.put('/:id', equipmentController.updateEquipmentItem);
router.delete('/:id', equipmentController.deleteEquipmentItem);

module.exports = router;