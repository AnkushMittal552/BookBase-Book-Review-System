import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useBooks = ({
  page = 1,
  limit = 40,
  category = '',
  search = '',
  source = 'static'
} = {}) => {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [meta, setMeta] = useState({
    total: 0,
    pages: 1,
    currentPage: 1
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page,
        limit,
        category,
        search
      }).toString();

      const endpoint = source === 'google' ? `/books/google?${query}` : `/books?${query}`;
      const res = await api.get(endpoint);
      let fetchedBooks = res.data.books || [];

      if (source === 'static' && typeof window !== 'undefined') {
        try {
          const extraBooks = JSON.parse(localStorage.getItem('staticDiscoverBooks')) || [];
          const ids = new Set(fetchedBooks.map((book) => book._id));
          fetchedBooks = [...fetchedBooks, ...extraBooks.filter((book) => !ids.has(book._id))];
        } catch (storageError) {
          console.error('Failed to load static discover additions:', storageError);
        }
      }

      setBooks(fetchedBooks);

      setMeta({
        total: res.data.total,
        pages: res.data.pages,
        currentPage: res.data.currentPage
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, search, source]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const refreshOnStaticUpdate = () => {
      if (source === 'static') {
        fetchBooks();
      }
    };

    window.addEventListener('staticDiscoverChanged', refreshOnStaticUpdate);
    return () => window.removeEventListener('staticDiscoverChanged', refreshOnStaticUpdate);
  }, [fetchBooks, source]);

  return {
    books,
    loading,
    error,
    meta,
    refetch: fetchBooks
  };
};

export const useBook = (id) => {

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBook = useCallback(async () => {

    if (!id) return;

    setLoading(true);
    setError(null);

    try {

      const res = await api.get(`/books/${id}`);

      setBook(res.data.book);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }, [id]);

  useEffect(() => {

    fetchBook();

  }, [fetchBook]);

  return {

    book,
    loading,
    error,
    refetch: fetchBook

  };

};