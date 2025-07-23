const express = require('express');
const router = express.Router();
const bookingController = require('../controller/booking.controller');
const auth = require('../middleware/auth');

router.post('/', auth.verifyToken, bookingController.createBooking);
router.get('/my-bookings', auth.verifyToken, bookingController.getUserBookings);
// router.get('/room/:roomId', bookingController.getBookingsForRoom);
router.post('/room-dates', auth.verifyToken,bookingController.getBookingsForRoom);
router.get('/owner', auth.verifyToken, bookingController.getOwnerRoomBooking)


module.exports = router;
