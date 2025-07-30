const Room = require('../model/room.model');
const User = require('../model/user.model');
async function getPendingRooms(req, res) {
  try {
    const rooms = await Room.find({ isApproved: false });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending rooms' });
  }
};

async function approveRoom(req, res) {
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

async function getOwnerListWithTheirRoomList(req, res) {
  try {
    const owners = await User.find({ role: 'owner' });
    // console.log('owners: ',owners);
    // For each owner, find their rooms
    const ownerRoomList = await Promise.all(owners.map(async (owner) => {
      const rooms = await Room.find({ ownerId: owner._id });
      return {
        owner: {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
        },
        rooms
      };
    }));

    res.status(200).json(ownerRoomList);
  } catch (err) {
    // console.error('Failed to fetch owner room list:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getPendingRooms, approveRoom, getOwnerListWithTheirRoomList } 