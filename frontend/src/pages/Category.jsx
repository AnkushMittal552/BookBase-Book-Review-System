import { useState, useMemo } from 'react';
import { HiSearch } from 'react-icons/hi';
import BookCard from '../components/BookCard';
import CategoryFilter from '../components/CategoryFilter';
import { useBooks } from '../hooks/useBooks';

export default function Category() {
  const { books, loading } = useBooks();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const BOOKS_PER_PAGE = 16;

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (book) =>
          book.title?.toLowerCase().includes(q) ||
          book.author?.toLowerCase().includes(q) ||
          book.description?.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      result = result.filter((book) =>
        book.categories?.includes(category)
      );
    }

    switch (sort) {
      case 'title':
        result.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case '-rating.average':
        result.sort(
          (a, b) =>
            (b.rating?.average || 0) -
            (a.rating?.average || 0)
        );
        break;

      case '-createdAt':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );
    }

    return result;
  }, [books, search, category, sort]);

  const paginatedBooks = useMemo(() => {
    const start = (page - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [filteredBooks, page]);

  const meta = {
    total: filteredBooks.length,
    pages: Math.max(
      1,
      Math.ceil(filteredBooks.length / BOOKS_PER_PAGE)
    )
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.elements.q.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            Browse Books
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            {meta.total} books found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">
            Sort:
          </label>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="input w-44 text-sm"
          >
            <option value="-createdAt">
              Newest
            </option>

            <option value="-rating.average">
              Top Rated
            </option>

            <option value="title">
              A–Z
            </option>
          </select>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="relative max-w-md"
      >
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          name="q"
          defaultValue={search}
          placeholder="Search books, authors..."
          className="input pl-9"
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1 px-3 text-sm"
        >
          Search
        </button>
      </form>

      {/* Categories */}
      <CategoryFilter
        active={category}
        onChange={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
      />

      {/* Books */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : paginatedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {paginatedBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">
            📭
          </span>

          <p className="text-lg font-medium">
            No books found
          </p>

          <p className="text-sm mt-1">
            Try a different search or category
          </p>
        </div>
      )}

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from(
            { length: meta.pages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 hover:bg-primary/10 border border-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}