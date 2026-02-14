// routes/pcbRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAllPCBs, createPCB, deletePCB } = require('../controllers/pcbController');

const router = express.Router();

router.get('/', authMiddleware, getAllPCBs);
router.post('/', authMiddleware, createPCB);
router.delete('/:id', authMiddleware, deletePCB);

module.exports = router;
