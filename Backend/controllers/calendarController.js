const calendarModel = require('../models/calendarModel');

const getCalendarActivities = async (req, res) => {
  try {
    const activities = await calendarModel.getAllCalendarActivities();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCalendarActivity = async (req, res) => {
  try {
    const activity = await calendarModel.getCalendarActivityById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = await calendarModel.createCalendarActivity(req.body);
    res.status(201).json(activity);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateActivity = async (req, res) => {
  try {
    const activity = await calendarModel.updateCalendarActivity(req.params.id, req.body);
    res.json(activity);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteActivity = async (req, res) => {
  try {
    await calendarModel.deleteCalendarActivity(req.params.id);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getCalendarActivities, getCalendarActivity, createActivity, updateActivity, deleteActivity };