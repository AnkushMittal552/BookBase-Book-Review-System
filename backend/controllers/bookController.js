const Book = require('../models/Book');

// @desc    Get all books (with filter, search, pagination)
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const {
      search, category, minPrice, maxPrice, isAudio,
      sort = '-createdAt', page = 1, limit = 12, recommended
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.categories = { $in: [category] };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }
    if (isAudio === 'true') query.isAudioBook = true;
    if (recommended === 'true') query.isRecommended = true;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-fileUrl -audioUrl'); // Don't expose download URLs publicly

    res.json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    // Increment view count
    book.viewCount += 1;
    await book.save({ validateBeforeSave: false });

    res.json({ success: true, book });
  } catch (error) {
    next(error);
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
    const books = await Book.find({ isRecommended: true })
      .sort('-rating.average')
      .limit(8);
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};
