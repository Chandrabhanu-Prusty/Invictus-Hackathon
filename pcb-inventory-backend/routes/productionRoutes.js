// routes/productionRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { addProduction } = require('../controllers/productionController');

const router = express.Router();

router.post('/add', authMiddleware, addProduction);

module.exports = router;
