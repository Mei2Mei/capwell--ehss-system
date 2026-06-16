const express = require('express');
const router = express.Router();
const sustainabilityController = require('../controllers/sustainabilityController');

router.get('/', sustainabilityController.getSustainabilityRecords);
router.get('/factors', sustainabilityController.getEmissionFactors);
router.get('/:id', sustainabilityController.getSustainabilityRecord);
router.post('/', sustainabilityController.createRecord);
router.put('/:id', sustainabilityController.updateRecord);
router.delete('/:id', sustainabilityController.deleteRecord);

module.exports = router;