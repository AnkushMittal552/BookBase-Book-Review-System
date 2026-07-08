const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
exports.getBookReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/reviews/book/:bookId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const existing = await Review.findOne({ book: req.params.bookId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this book' });
    }

    const review = await Review.create({
      book: req.params.bookId,
      user: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review.rating = req.body.rating || review.rating;
    review.title = req.body.title || review.title;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookId = review.book;
    await review.deleteOne();
    await Review.calcAverageRating(bookId);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
