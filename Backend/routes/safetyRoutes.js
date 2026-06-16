const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

router.get('/', safetyController.getSafetyRecords);
router.get('/:id', safetyController.getSafetyRecord);
router.post('/', safetyController.createRecord);
router.put('/:id', safetyController.updateRecord);
router.delete('/:id', safetyController.deleteRecord);

module.exports = router;
