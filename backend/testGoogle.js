const { fetchGoogleBooks } = require('./services/googleBooksService');
(async () => {
  try {
    const result = await fetchGoogleBooks({ query: 'harry potter', limit: 5, page: 1 });
    console.log(JSON.stringify(result.books.map(b => ({ id: b._id, title: b.title, coverImage: b.coverImage })), null, 2));
  } catch (err) {
    console.error('ERROR', err.message);
  }
})();
