const axios = require('axios');

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const normalizeYear = (publishedDate) => {
  if (!publishedDate) return 'Unknown';
  const match = String(publishedDate).match(/(\d{4})/);
  return match ? Number(match[1]) : 'Unknown';
};

const normalizeCoverUrl = (url = '') => {
  if (!url) return '';
  return url.startsWith('http://') ? url.replace(/^http:\/\//i, 'https://') : url;
};

const getBestCoverImage = (imageLinks = {}) => {
  const imageUrl = imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.small || imageLinks.thumbnail || imageLinks.smallThumbnail || '';
  return normalizeCoverUrl(imageUrl);
};

const getOpenLibraryCover = (industryIdentifiers = []) => {
  const isbn = industryIdentifiers.find((identifier) => identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10');
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn.identifier}-L.jpg?default=false` : '';
};

const mapGoogleBook = (volume, index) => {
  const info = volume?.volumeInfo || {};
  const thumbnail = getBestCoverImage(info.imageLinks);
  const openLibraryCover = !thumbnail ? getOpenLibraryCover(info.industryIdentifiers) : '';

  return {
    _id: volume?.id || String(index + 1),
    title: info.title || 'Unknown Title',
    author: Array.isArray(info.authors) ? info.authors.join(', ') : 'Unknown Author',
    description: info.description || 'No description available',
    categories: Array.isArray(info.categories) ? info.categories : [],
    coverImage: thumbnail || openLibraryCover || null,
    pages: info.pageCount || 0,
    rating: {
      average: info.averageRating || 0,
      count: info.ratingsCount || 0
    },
    readUrl: info.previewLink || null,
    previewUrl: info.previewLink || null,
    language: info.language || 'English',
    publishedYear: normalizeYear(info.publishedDate),
    publisher: info.publisher || '',
    isRecommended: index < 3
  };
};

const normalizeGoogleBooksQuery = (query = 'books') => {
  const trimmedQuery = String(query).trim();
  return trimmedQuery || 'books';
};

const buildGoogleBooksUrl = ({ query = 'books', startIndex = 0, limit = 12, apiKey = '' } = {}) => {
  const normalizedQuery = normalizeGoogleBooksQuery(query);
  const maxLimit = Math.min(Math.max(Number(limit) || 12, 1), 40);

  const params = new URLSearchParams({
    q: normalizedQuery,
    startIndex: String(Math.max(0, startIndex)),
    maxResults: String(maxLimit),
    langRestrict: 'en'
  });

  if (apiKey) {
    params.set('key', apiKey);
  }

  return `${GOOGLE_BOOKS_API_URL}?${params.toString()}`;
};

const fetchGoogleBooks = async ({ query = 'modern English fiction', page = 1, limit = 12 } = {}) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const requestedLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const targetStartIndex = (currentPage - 1) * requestedLimit;
  const pageLimit = 40;

  try {
    let allItems = [];
    let totalItems = 0;
    let fetched = 0;
    let startIndex = targetStartIndex;

    while (fetched < requestedLimit) {
      const remaining = requestedLimit - fetched;
      const batchLimit = Math.min(pageLimit, remaining);
      const url = buildGoogleBooksUrl({ query, startIndex, limit: batchLimit, apiKey });
      const res = await axios.get(url, { timeout: 10000 });
      const items = res.data.items || [];

      if (fetched === 0) {
        totalItems = res.data.totalItems || 0;
      }

      if (items.length === 0) {
        break;
      }

      allItems = allItems.concat(items.map(mapGoogleBook));
      fetched += items.length;
      startIndex += batchLimit;

      if (items.length < batchLimit) {
        break;
      }
    }

    return {
      success: true,
      books: allItems.slice(0, requestedLimit),
      total: totalItems || allItems.length,
      pages: Math.max(1, Math.ceil((totalItems || allItems.length) / requestedLimit)),
      currentPage
    };
  } catch (error) {
    console.error('Google Books API error:', error.message);
    return {
      success: false,
      books: [],
      total: 0,
      pages: 1,
      currentPage,
      error: error.message
    };
  }
};

const fetchGoogleBookById = async (volumeId) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
  const url = `${GOOGLE_BOOKS_API_URL}/${volumeId}${apiKey ? `?key=${apiKey}` : ''}`;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    return {
      success: true,
      book: mapGoogleBook(res.data, 0)
    };
  } catch (error) {
    console.error('Google Books API error:', error.message);
    return {
      success: false,
      book: null,
      error: error.message
    };
  }
};

module.exports = {
  mapGoogleBook,
  buildGoogleBooksUrl,
  fetchGoogleBooks,
  fetchGoogleBookById
};
