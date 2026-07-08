import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiBookOpen } from 'react-icons/hi';

export default function MyLibrary() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [library, setLibrary] = useState(
    user?.library || []
  );

  // Added localStorage support
  useEffect(() => {

    const localBooks =
      JSON.parse(localStorage.getItem('myLibrary')) || [];

    if (localBooks.length > 0) {

      const formattedBooks = localBooks.map(book => ({
        book,
        progress: 0,
        addedAt: new Date()
      }));

      setLibrary(formattedBooks);

    }

  }, []);

  return (
    <div className="space-y-6">

      <div>

        <h1 className="font-display text-2xl font-bold text-navy">
          My Library
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          {library.length} books in your collection
        </p>

      </div>

      {library.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 text-gray-400">

          <span className="text-5xl mb-3">
            📚
          </span>

          <p className="text-lg font-medium">
            Your library is empty
          </p>

          <p className="text-sm mt-1">
            Add books from the Discover page
          </p>

          <button
            onClick={() => navigate('/')}
            className="btn-primary mt-4"
          >
            Browse Books
          </button>

        </div>

      ) : (

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {library.map(({ book, progress, addedAt }) => (

            <div
              key={book._id}
              className="card p-3 cursor-pointer group"
              onClick={() => navigate(`/book/${book._id}`)}
            >

              <div className="relative overflow-hidden rounded-xl mb-3 aspect-[3/4] bg-gray-100">

                {book.coverImage

                  ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )

                  : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📖
                    </div>
                  )
                }

                {progress > 0 && (

                  <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-2 py-1">

                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                      />

                    </div>

                    <p className="text-white text-xs mt-0.5 text-center">
                      {progress}% read
                    </p>

                  </div>
                )}

              </div>

              <p className="text-sm font-semibold text-gray-800 truncate">
                {book.title}
              </p>

              <p className="text-xs text-gray-400 truncate">
                {book.author}
              </p>

              <div className="flex items-center gap-1 mt-2">

                <HiBookOpen className="text-primary text-xs" />

                <span className="text-xs text-gray-400">
                  {book.pages || '—'} pages
                </span>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}