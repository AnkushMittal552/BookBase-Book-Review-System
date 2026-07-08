const express = require('express');
const router = express.Router();
const {
  updateProfile, toggleFavourite, addToLibrary,
  updateProgress, getDownloads, getAllUsers
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',                                   protect, adminOnly, getAllUsers);
router.put('/profile',                            protect, updateProfile);
router.put('/favourites/:bookId',                 protect, toggleFavourite);
router.post('/library/:bookId',                   protect, addToLibrary);
router.put('/library/:bookId/progress',           protect, updateProgress);
router.get('/downloads',                          protect, getDownloads);

module.exports = router;
