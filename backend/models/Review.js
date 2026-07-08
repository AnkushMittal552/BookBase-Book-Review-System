const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Min rating is 1'],
    max: [5, 'Max rating is 5']
  },
  title: {
    type: String,
    maxlength: [100, 'Review title too long'],
    default: ''
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment too long']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// One review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Recalculate book average rating after save/delete
reviewSchema.statics.calcAverageRating = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, numRatings: { $sum: 1 } } }
  ]);

  const Book = require('./Book');
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].numRatings
    });
  } else {
    await Book.findByIdAndUpdate(bookId, { 'rating.average': 0, 'rating.count': 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.book);
});

reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.book);
});

module.exports = mongoose.model('Review', reviewSchema);
