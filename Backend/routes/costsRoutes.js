const express = require('express');
const router = express.Router();
const costsController = require('../controllers/costsController');

router.get('/', costsController.getCostRecords);
router.get('/:id', costsController.getCostRecord);
router.post('/', costsController.createRecord);
router.put('/:id', costsController.updateRecord);
router.delete('/:id', costsController.deleteRecord);

module.exports = router;