const Book = require('../models/Book');
const Review = require('../models/Review');
const axios = require('axios');
const {
  fetchGoogleBooks,
  fetchGoogleBookById
} = require('../services/googleBooksService');

const getRatingStats = async (bookIds) => {
  if (!Array.isArray(bookIds) || bookIds.length === 0) {
    return {};
  }

  const stats = await Review.aggregate([
    { $match: { book: { $in: bookIds } } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, numRatings: { $sum: 1 } } }
  ]);

  return stats.reduce((acc, item) => {
    acc[item._id] = {
      average: Number(item.avgRating.toFixed(1)),
      count: item.numRatings
    };
    return acc;
  }, {});
};

// @desc    Get all books (with filter, search, pagination)
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      page = 1,
      limit = 50,
      recommended
    } = req.query;

    let filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      filter.categories = category;
    }

    if (recommended === "true") {
      filter.isRecommended = true;
    }

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      books,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Search Google Books
// @route   GET /api/books/google
// @access  Public
exports.getGoogleBooks = async (req, res, next) => {
  try {

    const {
      search = '',
      page = 1,
      limit = 50
    } = req.query;

    const response = await fetchGoogleBooks({
      query: search || 'popular books',
      page,
      limit
    });

    const books = (response.books || []).map(book => ({
      ...book,
      source: 'google'
    }));

    res.json({
      success: true,
      books,
      total: response.total,
      pages: response.pages,
      currentPage: response.currentPage
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Find a playable YouTube audiobook video
// @route   GET /api/books/audio/search
// @access  Public
exports.searchAudioBookVideo = async (req, res, next) => {
  try {
    const { title = '', author = '' } = req.query;
    const query = `${title} ${author}`.trim();
    // Keep compatibility with the existing frontend-named variable while
    // allowing deployments to use the server-side YOUTUBE_API_KEY name.
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;

    if (!query) {
      return res.status(400).json({ success: false, message: 'A book title is required' });
    }

    if (!youtubeApiKey) {
      return res.status(503).json({
        success: false,
        message: 'YouTube search is not configured on the server'
      });
    }

    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} audiobook`,
        maxResults: 1,
        type: 'video',
        videoEmbeddable: 'true',
        key: youtubeApiKey
      },
      timeout: 10000
    });

    res.json({
      success: true,
      videoId: data.items?.[0]?.id?.videoId || null
    });
  } catch (error) {
    if (error.response?.status === 403) {
      return res.status(502).json({
        success: false,
        message: 'YouTube rejected the configured API key or its quota has been reached'
      });
    }
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {

    let book = await Book.findById(req.params.id);

    // If not found in MongoDB, check Google Books
    if (!book) {

      const response = await fetchGoogleBookById(req.params.id);

      if (!response.success || !response.book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }

      book = response.book;
    }

    const ratingStats = await Review.aggregate([
      {
        $match: {
          book: req.params.id
        }
      },
      {
        $group: {
          _id: '$book',
          avgRating: { $avg: '$rating' },
          numRatings: { $sum: 1 }
        }
      }
    ]);

    const reviewStats = ratingStats[0];

    const result = {
      ...book.toObject?.() || book,
      rating: reviewStats
        ? {
            average: Number(reviewStats.avgRating.toFixed(1)),
            count: reviewStats.numRatings
          }
        : book.rating || {
            average: 0,
            count: 0
          }
    };

    res.json({
      success: true,
      book: result
    });

  } catch (err) {

    next(err);

  }
};

// @desc    Create book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    req.body.addedBy = req.user._id;
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get download URL (protected)
// @route   GET /api/books/:id/download
// @access  Private
exports.downloadBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('+fileUrl');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (!book.fileUrl) return res.status(404).json({ success: false, message: 'No file available' });

    book.downloadCount += 1;
    await book.save({ validateBeforeSave: false });

    // Add to user's downloads
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { downloads: book._id }
    });

    res.json({ success: true, fileUrl: book.fileUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended books
// @route   GET /api/books/recommended
// @access  Public
exports.getRecommended = async (req, res, next) => {
  try {

    const books = await Book.find({
      isRecommended: true
    }).limit(8);

    res.json({
      success: true,
      books
    });

  } catch (err) {

    next(err);

  }
};
