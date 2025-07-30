const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String }, // e.g., "approved_room", "rejected_listing"
  targetId: { type: mongoose.Schema.Types.ObjectId }, // roomId, userId etc.
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', adminLogSchema);
