const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');

router.get('/', complianceController.getComplianceItems);
router.get('/:id', complianceController.getComplianceItem);
router.post('/', complianceController.createItem);
router.put('/:id', complianceController.updateItem);
router.delete('/:id', complianceController.deleteItem);

module.exports = router;