const User = require('../models/User');

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favourite book
// @route   PUT /api/users/favourites/:bookId
// @access  Private
exports.toggleFavourite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;
    const isFav = user.favourites.includes(bookId);

    if (isFav) {
      user.favourites = user.favourites.filter(id => id.toString() !== bookId);
    } else {
      user.favourites.push(bookId);
    }

    await user.save();
    res.json({ success: true, isFavourite: !isFav, message: isFav ? 'Removed from favourites' : 'Added to favourites' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to library
// @route   POST /api/users/library/:bookId
// @access  Private
exports.addToLibrary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const bookId = req.params.bookId;
    const exists = user.library.some(item => item.book.toString() === bookId);

    if (!exists) {
      user.library.push({ book: bookId });
      await user.save();
    }

    res.json({ success: true, message: 'Added to library' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reading progress
// @route   PUT /api/users/library/:bookId/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    await User.findOneAndUpdate(
      { _id: req.user._id, 'library.book': req.params.bookId },
      { $set: { 'library.$.progress': progress } }
    );
    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user downloads
// @route   GET /api/users/downloads
// @access  Private
exports.getDownloads = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('downloads', 'title author coverImage categories');
    res.json({ success: true, downloads: user.downloads });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};