const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, createBook, updateBook,
  deleteBook, downloadBook, getRecommended
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/recommended', getRecommended);
router.get('/',            getBooks);
router.get('/:id',         getBook);
router.get('/:id/download', protect, downloadBook);

router.post('/',      protect, adminOnly, createBook);
router.put('/:id',    protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
