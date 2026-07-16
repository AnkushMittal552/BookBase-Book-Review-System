const fs = require("fs");
const path = require("path");

const booksPath = path.join(__dirname, "books.json");

// Read books
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));

// Add Google Books search link
const updatedBooks = books.map(book => ({
  ...book,

  readUrl: `https://books.google.com/books?q=${encodeURIComponent(
    `${book.title} ${book.author}`
  )}`
}));

// Save new file
fs.writeFileSync(
  path.join(__dirname, "books-with-links.json"),
  JSON.stringify(updatedBooks, null, 2)
);

console.log("✅ books-with-links.json created successfully!");