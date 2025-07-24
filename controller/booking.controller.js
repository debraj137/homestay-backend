const Room = require('../model/room.model');
const Booking = require('../model/booking.model');

async function createBooking(req, res){
    try {
      // console.log('request in createBooking: ',req);
    const { roomId, checkInDate, checkOutDate, guestCount, totalPrice } = req.body;

    const room = await Room.findById(roomId);
    // console.log('room in createBooking: ',room);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // ✅ Validate guest count
    if (guestCount > room.maximumAllowedGuest) {
      return res.status(400).json({
        message: `Guest count exceeds allowed limit. Max allowed: ${room.maximumAllowedGuest}`
      });
    }

    // ✅ Check for overlapping bookings
    const overlapping = await Booking.find({
      roomId,
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) }
    });

    if (overlapping.length > 0) {
      return res.status(400).json({ message: 'Room is not available for selected dates' });
    }

    // ✅ Proceed to create booking if available
    const booking = new Booking({
      roomId,
      guestCount,
      userId: req.user.userId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();
    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (err) {
    // console.error('err in booking: ',err);
    res.status(500).json({ message: 'Booking failed' }); 
  }
};

async function getUserBookings(req, res){
  // console.log('req in getUserBookings: ',req);
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).populate('roomId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

async function getAllBooking(req, res) {
  try {
     const bookings = await Booking.find()
    .populate('roomId')  // Already populated
    .populate('userId', 'name email') // 👈 Only fetch name & email of user
    .exec();

  res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

async function getBookingsForRoom(req, res) {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const bookings = await Booking.find({ roomId }).select('checkInDate checkOutDate');
    res.json(bookings);
  } catch (err) {
    // console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

async function getOwnerRoomBooking(req, res) {
  // console.log('req: ',req);
  try {
    const ownerId = req.user.userId; // Assuming `verifyToken` adds the user
    // console.log('ownerId: ',ownerId)
    // Step 1: Get all rooms owned by the logged-in owner
    const ownerRooms = await Room.find({ ownerId });
    // console.log('ownerRooms: ',ownerRooms);
    // Step 2: Extract room IDs
    const roomIds = ownerRooms.map(room => room._id);

    // Step 3: Get bookings for those rooms
    const bookings = await Booking.find({ roomId: { $in: roomIds } })
      .populate('roomId')
      .populate('userId');

    res.json({ bookings, ownerRooms });
  } catch (error) {
    // console.error('Owner Booking Fetch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {createBooking, getUserBookings, getBookingsForRoom, getOwnerRoomBooking, getAllBooking}