import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiMicrophone,
  HiPlay
} from 'react-icons/hi';

import { audioBooks } from '../services/audioBooks';
import { searchAudiobook } from '../services/youtube';
import StarRating from '../components/StarRating';

const AUDIOBOOK_CACHE_KEY = 'youtube-audiobooks-v2';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_BOOKS_PER_LOOKUP = 10;

export default function AudioBooks() {

  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    const load = async () => {
      const cached = JSON.parse(localStorage.getItem(AUDIOBOOK_CACHE_KEY) || 'null');
      if (cached?.savedAt && Date.now() - cached.savedAt < CACHE_DURATION_MS) {
        setBooks(cached.books?.length ? cached.books : audioBooks);
        setLoading(false);
        return;
      }

      // The general books endpoint does not provide an audiobook filter. Using
      // it here returned regular (and sometimes fictional) books, so none of
      // the YouTube lookups matched and the audiobook page appeared empty.
      // Show the curated audiobook catalogue immediately, then enrich it with
      // YouTube video IDs where the lookup is available.
      setBooks(audioBooks);
      setLoading(false);
      await loadYouTubeBooks(audioBooks);
    };

    const loadYouTubeBooks = async (candidateBooks) => {
      let failedStatus;
      // Searching YouTube is quota-limited. The service caches each result, and
      // this cap avoids consuming the full daily quota on one first-time visit.
      const results = [];
      for (const book of candidateBooks.slice(0, MAX_BOOKS_PER_LOOKUP)) {
        try {
          const videoId = await searchAudiobook(book.title, book.author);
          if (videoId) results.push({ ...book, videoId });
        } catch (error) {
          failedStatus = error.status || failedStatus;
          // Do not continue issuing requests once YouTube reports exhausted quota.
          if (error.status === 429) break;
        }
      }

      const videoIds = new Map(results.map((book) => [book._id, book.videoId]));
      const enrichedBooks = candidateBooks.map((book) => (
        videoIds.has(book._id) ? { ...book, videoId: videoIds.get(book._id) } : book
      ));
      setBooks(enrichedBooks);

      localStorage.setItem(AUDIOBOOK_CACHE_KEY, JSON.stringify({
        savedAt: Date.now(),
        books: enrichedBooks
      }));

      if (failedStatus === 429) {
        setLookupError('YouTube API quota has been reached. Please try again after the quota resets.');
      } else if (failedStatus) {
        setLookupError('YouTube availability could not be checked. Select a book to try playing it.');
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">

          <HiMicrophone className="text-primary text-xl" />

        </div>

        <div>

          <h1 className="font-display text-2xl font-bold text-navy">
            Audio Books
          </h1>

          <p className="text-gray-400 text-sm mt-0.5">
            {books.length} audio books available
          </p>

        </div>

      </div>

      {books.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 text-gray-400">

          <HiMicrophone className="text-6xl mb-3" />

          <p className="text-lg font-medium">
            {lookupError || 'No audio books found on YouTube'}
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {books.map(book => (

            <div
              key={book._id}
              className="card p-4 flex gap-4 cursor-pointer group hover:shadow-hover transition-all"
              onClick={() =>
                navigate(
                  `/audio/${book._id}${book.videoId ? `?video=${encodeURIComponent(book.videoId)}` : ''}`
                )
              }
            >

              <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">

                {book.coverImage ? (

                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🎧
                  </div>

                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                  <HiPlay className="text-white text-2xl" />

                </div>

              </div>

              <div className="flex-1 min-w-0">

                <p className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                  {book.title}
                </p>

                <p className="text-sm text-gray-400 mt-0.5">
                  {book.author}
                </p>

                <StarRating
                  rating={book.rating?.average}
                  size="sm"
                />

                {book.price > 0 ? (

                  <p className="text-sm font-semibold text-primary mt-1">
                    ₹{book.price}
                  </p>

                ) : (

                  <p className="text-sm text-green-500 font-medium mt-1">
                    Free
                  </p>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
