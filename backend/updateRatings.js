const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const Book = require('./models/Book');
const Review = require('./models/Review');

connectDB();

const updateRatings = async () => {

  try {

    const books = await Book.find();

    for (const book of books) {

      await Review.calcAverageRating(book._id);

    }

    console.log("✅ Ratings Updated Successfully");

    process.exit();

  } catch (err) {

    console.log(err);

    process.exit();

  }

};

updateRatings();