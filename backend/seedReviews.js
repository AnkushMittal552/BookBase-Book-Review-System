const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const Book = require('./models/Book');
const User = require('./models/User');
const Review = require('./models/Review');

connectDB();

const comments = [
  "Excellent book. Highly recommended!",
  "One of the best books I have ever read.",
  "Very informative and well written.",
  "Amazing storytelling.",
  "Easy to understand and enjoyable.",
  "Fantastic read.",
  "Loved every chapter.",
  "Great explanations and examples.",
  "Highly recommended for beginners.",
  "Worth reading twice."
];

const titles = [
  "Excellent",
  "Must Read",
  "Highly Recommended",
  "Amazing",
  "Loved It",
  "Very Good",
  "Fantastic",
  "Brilliant",
  "Great Book",
  "Wonderful"
];

const seedReviews = async () => {

  try {

    console.log("Removing old reviews...");

    await Review.deleteMany();

    const books = await Book.find();

    const users = await User.find();

    if (books.length === 0) {

      console.log("No books found.");

      process.exit();

    }

    if (users.length === 0) {

      console.log("No users found.");

      process.exit();

    }

    const reviews = [];

    for (const book of books) {

      // One review per available user
      for (const user of users) {

        reviews.push({

          book: book._id,

          user: user._id,

          rating: Math.floor(Math.random() * 2) + 4,

          title: titles[
            Math.floor(Math.random() * titles.length)
          ],

          comment: comments[
            Math.floor(Math.random() * comments.length)
          ],

          edited: false,

          likes: []

        });

      }

    }

    await Review.insertMany(reviews);

    console.log(`${reviews.length} reviews inserted successfully.`);

    process.exit();

  } catch (err) {

    console.error(err);

    process.exit();

  }

};

seedReviews();