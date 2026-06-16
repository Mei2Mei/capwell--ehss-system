const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Capwell EHSS Backend API running');
});

const ppeRoutes = require('./routes/ppeRoutes');
app.use('/api/ppe', ppeRoutes);

const safetyRoutes = require('./routes/safetyRoutes');
app.use('/api/safety', safetyRoutes);

const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);

const costsRoutes = require('./routes/costsRoutes');
app.use('/api/costs', costsRoutes);

const complianceRoutes = require('./routes/complianceRoutes');
app.use('/api/compliance', complianceRoutes);

const sustainabilityRoutes = require('./routes/sustainabilityRoutes');
app.use('/api/sustainability', sustainabilityRoutes);

const reportsRoutes = require('./routes/reportsRoutes');
app.use('/api/reports', reportsRoutes);

const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', equipmentRoutes);

const actionTrackerRoutes = require('./routes/actionTrackerRoutes');
app.use('/api/actionTracker', actionTrackerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));