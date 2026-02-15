// routes/pcbRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAllPCBs, createPCB, deletePCB, addBOMRow, removeBOMRow, updateBOMRow } = require('../controllers/pcbController');

const router = express.Router();

router.get('/', authMiddleware, getAllPCBs);
router.post('/', authMiddleware, createPCB);
router.delete('/:id', authMiddleware, deletePCB);

// BOM row management
router.post('/:id/bom', authMiddleware, addBOMRow);
router.put('/:id/bom/:rowId', authMiddleware, updateBOMRow);
router.delete('/:id/bom/:rowId', authMiddleware, removeBOMRow);

module.exports = router;
