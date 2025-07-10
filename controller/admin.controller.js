const Room = require('../model/room.model');

async function getPendingRooms(req, res){
  try {
    const rooms = await Room.find({ isApproved: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending rooms' });
  }
};

async function approveRoom(req, res){
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room approved', room });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve room' });
  }
};

module.exports = {getPendingRooms, approveRoom}