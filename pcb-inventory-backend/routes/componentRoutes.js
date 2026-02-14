// routes/componentRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAllComponents,
  addComponent,
  updateComponent,
  deleteComponent
} = require('../controllers/componentController');

const router = express.Router();

router.get('/', authMiddleware, getAllComponents);
router.post('/', authMiddleware, addComponent);
router.put('/:id', authMiddleware, updateComponent);
router.delete('/:id', authMiddleware, deleteComponent);

module.exports = router;
