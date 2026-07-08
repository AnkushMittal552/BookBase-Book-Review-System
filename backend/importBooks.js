const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Book = require('./models/Book');
const books = require('./books.json');

dotenv.config();

connectDB();

const importData = async () => {
  try {

    // Delete all existing books
    await Book.deleteMany({});
    console.log('🗑️ Existing books deleted');

    // Insert new books
    await Book.insertMany(books);
    console.log(`✅ ${books.length} books imported successfully`);

    process.exit();

  } catch (err) {

    console.error(err);

    process.exit(1);

  }
};

importData();