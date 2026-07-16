const test = require('node:test');
const assert = require('node:assert/strict');
const { mapGoogleBook, buildGoogleBooksUrl } = require('../services/googleBooksService');

test('mapGoogleBook converts Google volume data to the app shape and prefers larger covers', () => {
  const volume = {
    id: 'abc123',
    volumeInfo: {
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      description: 'A handbook of agile software craftsmanship.',
      categories: ['Computers', 'Programming'],
      imageLinks: {
        smallThumbnail: 'https://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=1',
        thumbnail: 'https://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=2',
        small: 'https://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=3',
        medium: 'https://books.google.com/books/content?id=abc123&printsec=frontcover&img=1&zoom=4'
      },
      pageCount: 464,
      averageRating: 4.5,
      ratingsCount: 120,
      language: 'en',
      publishedDate: '2008-08-01',
      publisher: 'Prentice Hall'
    }
  };

  const book = mapGoogleBook(volume, 0);

  assert.equal(book._id, 'abc123');
  assert.equal(book.title, 'Clean Code');
  assert.equal(book.author, 'Robert C. Martin');
  assert.equal(book.description, 'A handbook of agile software craftsmanship.');
  assert.deepEqual(book.categories, ['Computers', 'Programming']);
  assert.match(book.coverImage, /zoom=4/);
  assert.equal(book.pages, 464);
  assert.equal(book.rating.average, 4.5);
  assert.equal(book.rating.count, 120);
  assert.equal(book.language, 'en');
  assert.equal(book.publishedYear, 2008);
  assert.equal(book.publisher, 'Prentice Hall');
});

test('mapGoogleBook falls back to Open Library by ISBN when Google cover is missing', () => {
  const volume = {
    id: 'abc123',
    volumeInfo: {
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      description: 'A handbook of agile software craftsmanship.',
      categories: ['Computers', 'Programming'],
      industryIdentifiers: [
        { type: 'ISBN_13', identifier: '9780132350884' }
      ],
      pageCount: 464,
      averageRating: 4.5,
      ratingsCount: 120,
      language: 'en',
      publishedDate: '2008-08-01',
      publisher: 'Prentice Hall'
    }
  };

  const book = mapGoogleBook(volume, 0);

  assert.equal(book.coverImage, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg?default=false');
});

test('buildGoogleBooksUrl includes the search query and optional API key', () => {
  const url = buildGoogleBooksUrl({ query: 'javascript', page: 2, limit: 10, apiKey: 'secret-key' });

  assert.match(url, /q=javascript/);
  assert.match(url, /startIndex=10/);
  assert.match(url, /maxResults=10/);
  assert.match(url, /key=secret-key/);
});

test('buildGoogleBooksUrl uses the provided query and restricts to English', () => {
  const url = buildGoogleBooksUrl({ query: 'romance', page: 1, limit: 12, apiKey: 'secret-key' });

  assert.match(url, /q=romance/);
  assert.match(url, /langRestrict=en/);
});

test('buildGoogleBooksUrl defaults to broad English books when no query is provided', () => {
  const url = buildGoogleBooksUrl({ page: 1, limit: 12, apiKey: 'secret-key' });

  assert.match(url, /q=books/);
  assert.match(url, /langRestrict=en/);
});
