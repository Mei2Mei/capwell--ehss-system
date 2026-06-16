const express = require('express');
const router = express.Router();
const actionTrackerController = require('../controllers/actionTrackerController');

router.get('/', actionTrackerController.getActions);
router.get('/:id', actionTrackerController.getAction);
router.post('/', actionTrackerController.createActionItem);
router.put('/:id', actionTrackerController.updateActionItem);
router.delete('/:id', actionTrackerController.deleteActionItem);

module.exports = router;