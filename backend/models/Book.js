const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description too long']
  },
  coverImage: {
    type: String,
    default: ''
  },
  categories: [{
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Drama', 'Business',
           'Education', 'Geography', 'Biography', 'Self-Help', 'Mystery',
           'Romance', 'Horror', 'History', 'Science', 'Technology', 'Audio']
  }],
  price: {
    type: Number,
    default: 0,    // 0 = free
    min: [0, 'Price cannot be negative']
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isAudioBook: {
    type: Boolean,
    default: false
  },
  pages: {
    type: Number,
    default: 0
  },
  publisher: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  language: {
    type: String,
    default: 'English'
  },
  isbn: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,   // PDF download link
    default: ''
  },
  readUrl: {
  type: String,
  default: ''
},
  audioUrl: {
    type: String,   // Audio file link
    default: ''
  },
  // Aggregated rating (updated on review add/edit/delete)
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 }
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isRecommended: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Full-text search index
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Book', bookSchema);
