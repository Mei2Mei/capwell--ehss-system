const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Capwell EHSS Backend API running');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const ppeRoutes = require('./routes/ppeRoutes');
app.use('/api/ppe', requireAuth, ppeRoutes);

const safetyRoutes = require('./routes/safetyRoutes');
app.use('/api/safety', requireAuth, safetyRoutes);

const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', requireAuth, calendarRoutes);

const costsRoutes = require('./routes/costsRoutes');
app.use('/api/costs', requireAuth, costsRoutes);

const complianceRoutes = require('./routes/complianceRoutes');
app.use('/api/compliance', requireAuth, complianceRoutes);

const sustainabilityRoutes = require('./routes/sustainabilityRoutes');
app.use('/api/sustainability', requireAuth, sustainabilityRoutes);

const reportsRoutes = require('./routes/reportsRoutes');
app.use('/api/reports', requireAuth, reportsRoutes);

const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', requireAuth, equipmentRoutes);

const actionTrackerRoutes = require('./routes/actionTrackerRoutes');
app.use('/api/actionTracker', requireAuth, actionTrackerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const { requireAuth } = require('./middleware/auth');
