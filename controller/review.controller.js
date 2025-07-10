const Review = require('../model/review.model');

async function addReview(req, res){
  try {
    const { roomId, rating, comment } = req.body;
    const review = new Review({
      roomId,
      userId: req.user.userId,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review' });
  }
};

async function getRoomReviews(req, res){
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ roomId }).populate('userId', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

module.exports = {addReview, getRoomReviews}
