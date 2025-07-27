const sendEmail = require('../utils/emailService');
const Room = require('../model/room.model');
const Booking = require('../model/booking.model');
const User = require('../model/user.model');
async function createBooking(req, res) {
  try {
    // console.log('request in createBooking: ',req);
    const { userId, roomId, checkInDate, checkOutDate, guestCount, totalPrice } = req.body;
    console.log('req in createBooking: ',req.body);
    // const room = await Room.findById(roomId);
    const room = await Room.findById(roomId).populate('ownerId');
    const user = await User.findById(userId);
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
      status: 'confirmed',
      userId
    });

    await booking.save();
    //   res.status(201).json({ message: 'Booking confirmed', booking });
    // } catch (err) {
    //   // console.error('err in booking: ',err);
    //   res.status(500).json({ message: 'Booking failed' }); 
    // }
    // Fetch room and users
    // const room = await Room.findById(roomId).populate('ownerId');
    // const user = await User.findById(userId);

    const bookingDetails = `
      <h2>Booking Details</h2>
      <p><strong>Room:</strong> ${room.title}</p>
      <p><strong>Location:</strong> ${room.location.city}</p>
      <p><strong>Check-In:</strong> ${checkInDate}</p>
      <p><strong>Check-Out:</strong> ${checkOutDate}</p>
      <p><strong>Guest Count:</strong> ${guestCount}</p>
      <p><strong>Total Price:</strong> ₹${totalPrice}</p>
    `;

    const userDetails = `
      <h2>User Details</h2>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;

    // Send emails
    await sendEmail(user.email, 'Booking Confirmation', bookingDetails + userDetails);
    await sendEmail(room.ownerId.email, 'New Booking for Your Room', userDetails + bookingDetails);

    res.status(201).json({ message: 'Booking created and emails sent', booking });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

async function getUserBookings(req, res) {
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

module.exports = { createBooking, getUserBookings, getBookingsForRoom, getOwnerRoomBooking, getAllBooking }