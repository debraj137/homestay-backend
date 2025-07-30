const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
// const authRoute = require("../homestay-backend/route/auth.route");
const authRoute = require("../homestay-backend-mobileNumber/route/auth.route");
const adminRoute = require("../homestay-backend-mobileNumber/route/admin.route");
const bookingRoute = require("../homestay-backend-mobileNumber/route/booking.route");
const roomRoute = require("../homestay-backend-mobileNumber/route/room.route");
const reviewRoute = require("../homestay-backend-mobileNumber/route/review.route");
app.use(cors());
app.use("/auth", authRoute);
app.use("/rooms", roomRoute);
app.use("/bookings", bookingRoute);
app.use("/reviews", reviewRoute);
app.use("/admin", adminRoute);
mongoose.connect(process.env.DB_URL)
  .then(() => app.listen(process.env.PORT || 3000, () =>
    console.log('Server running')))
  .catch(err => console.log(err));



// const Room = require('../homestay-backend/model/room.model')
// async function backfillMaximumGuests() {
//   const result = await Room.updateMany(
//     { maximumAllowedGuest: { $exists: false } },
//     { $set: { maximumAllowedGuest: 2 } }
//   );
//   console.log(`Backfilled ${result.modifiedCount} room(s) with max guests`);
// }

// backfillMaximumGuests(); 

