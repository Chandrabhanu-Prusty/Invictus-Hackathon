// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const excelRoutes = require('./routes/excelRoutes');
const authRoutes = require('./routes/authRoutes');
const componentRoutes = require('./routes/componentRoutes');
const pcbRoutes = require('./routes/pcbRoutes');
const productionRoutes = require('./routes/productionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/excel', excelRoutes);
app.use('/components', componentRoutes);
app.use('/pcbs', pcbRoutes);
app.use('/production', productionRoutes);
app.use('/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'PCB Inventory Backend is running' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;