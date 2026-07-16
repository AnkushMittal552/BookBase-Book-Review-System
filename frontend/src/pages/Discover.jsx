import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowRight, HiBookOpen } from 'react-icons/hi';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';
//import { searchBooks } from '../services/googleBooks';
import { useBooks } from '../hooks/useBooks';

export default function Discover() {
  const navigate = useNavigate();
  const [source, setSource] = useState('static');
  const [googleQuery, setGoogleQuery] = useState('');

  const { books, loading } = useBooks({
    limit: 50,
    source,
    search: source === 'google' ? googleQuery : ''
  });

  const recommended = books.filter((book) => book.isRecommended);
  const featured = recommended[0] || books[0];
  const featuredRating = source === 'static' ? 0 : featured?.rating?.average || 0;
  const featuredRatingCount = source === 'static' ? 0 : featured?.rating?.count || 0;


  // useEffect(() => {
  //   const load = async () => {
  //     setLoading(true);

  //     try {
  //       const googleBooks = await searchBooks('popular books');

  //       setRecommended(googleBooks.slice(0, 10));
  //       setCategoryBooks(googleBooks.slice(10, 20));

  //       if (googleBooks.length > 0) {
  //         setFeatured(googleBooks[0]);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   load();
  // }, []);


  // const loadCategory = async (cat) => {
  //   setActiveCat(cat);

  //   try {
  //     const query = cat || 'books';

  //     const googleBooks = await searchBooks(query);

  //     setCategoryBooks(googleBooks);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const loadCategory = (cat) => {
  setActiveCat(cat);
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left content */}
      <div className="flex-1 min-w-0 space-y-8">

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">
                Discover
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {source === 'google'
                  ? 'Search the Google Books API for any available title.'
                  : 'Browse the curated static modern book collection.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSource('static')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  source === 'static'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                BookBase Library
              </button>

              <button
                onClick={() => setSource('google')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  source === 'google'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Google Books
              </button>
            </div>
          </div>

          {source === 'google' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.elements.q.value.trim();
                setGoogleQuery(query);
              }}
              className="flex gap-2 mb-4"
            >
              <input
                name="q"
                defaultValue={googleQuery}
                placeholder="Search Google Books..."
                className="input flex-1"
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 text-sm"
              >
                Search
              </button>
            </form>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-navy">
              Recommended
            </h2>

            <button
              onClick={() => navigate('/category')}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              See All <HiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommended.length > 0 ? (
              recommended.map((book) => (
                <BookCard key={book._id} book={book} showRating={source !== 'static'} />
              ))
            ) : (
              <p className="col-span-full text-gray-400 text-sm py-8 text-center">
                No recommended books yet
              </p>
            )}
          </div>
        </section>

        {/* All Books */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-navy">
              All Books
            </h2>

            <button
              onClick={() => navigate('/category')}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              See All <HiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.length > 0 ? (
              books.map((book) => (
                <BookCard key={book._id} book={book} showRating={source !== 'static'} />
              ))
            ) : (
              <p className="col-span-full text-gray-400 text-sm py-8 text-center">
                No books found
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Featured panel */}
      {featured && (
        <aside className="hidden xl:flex w-64 bg-navy rounded-2xl p-6 flex-col text-white shrink-0">
          <div className="flex-1 flex flex-col items-center">

            <div className="w-36 h-48 rounded-xl overflow-hidden shadow-2xl mb-4">
              {featured.coverImage ? (
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-5xl">
                  📖
                </div>
              )}
            </div>

            <h3 className="font-display font-bold text-lg text-center leading-tight">
              {featured.title}
            </h3>

            <p className="text-white/60 text-sm text-center mt-1">
              {featured.author}
            </p>

            <div className="flex items-center gap-1 mt-2">
              <StarRating
                rating={featuredRating}
                size="sm"
              />

              <span className="text-yellow-400 text-sm font-semibold ml-1">
                {featuredRating}
              </span>
            </div>

            <div className="flex gap-4 mt-4 text-center">
              <div>
                <p className="font-bold text-base">
                  {featured.pages || '—'}
                </p>
                <p className="text-white/50 text-xs">
                  Pages
                </p>
              </div>

              <div>
                <p className="font-bold text-base">
                  {featuredRatingCount}
                </p>
                <p className="text-white/50 text-xs">
                  Ratings
                </p>
              </div>
            </div>

            <p className="text-white/60 text-xs mt-4 leading-relaxed line-clamp-5">
              {featured.description}
            </p>
          </div>

          <button
            onClick={() => navigate(`/book/${featured._id}`)}
            className="mt-6 bg-primary hover:bg-primary-light text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <HiBookOpen />
            Read Now
          </button>
        </aside>
      )}
    </div>
  );
}