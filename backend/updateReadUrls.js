const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./models/Book");

dotenv.config();

const books = require("./books.json");

async function updateBooks() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected");

  for (const item of books) {
    await Book.updateOne(
      {
        title: item.title,
        author: item.author
      },
      {
        $set: {
          readUrl: item.readUrl
        }
      }
    );

    console.log("Updated:", item.title);
  }

  console.log("All books updated");
  process.exit();
}

updateBooks();