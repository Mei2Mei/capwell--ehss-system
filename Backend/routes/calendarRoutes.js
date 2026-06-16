const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.get('/', calendarController.getCalendarActivities);
router.get('/:id', calendarController.getCalendarActivity);
router.post('/', calendarController.createActivity);
router.put('/:id', calendarController.updateActivity);
router.delete('/:id', calendarController.deleteActivity);

module.exports = router;