import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useBooks = ({
  page = 1,
  limit = 100,
  category = '',
  search = ''
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

      const res = await api.get(`/books?${query}`);

      setBooks(res.data.books);

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
  }, [page, limit, category, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

  useEffect(() => {

    if (!id) return;

    const fetchBook = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();

  }, [id]);

  return {
    book,
    loading,
    error
  };
};