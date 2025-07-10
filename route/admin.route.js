const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const auth = require('../middleware/auth');

// Middleware to restrict to admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

router.get('/pending-rooms', auth.verifyToken, adminOnly, adminController.getPendingRooms);
router.patch('/approve-room/:id', auth.verifyToken, adminOnly, adminController.approveRoom);

module.exports = router;
