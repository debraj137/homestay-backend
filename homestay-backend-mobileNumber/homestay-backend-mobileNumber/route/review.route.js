const express = require('express');
const router = express.Router();
const reviewController = require('../controller/review.controller');
const auth = require('../middleware/auth');

router.post('/', auth.verifyToken, reviewController.addReview);
router.get('/:roomId', reviewController.getRoomReviews);

module.exports = router;
