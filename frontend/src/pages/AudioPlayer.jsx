import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiHeart,
  HiBookOpen,
  HiTrash,
  HiOutlineTrash
} from 'react-icons/hi';

import { audioBooks } from '../services/audioBooks';
import { searchAudiobook } from '../services/youtube';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getYouTubeVideoId = (value) => {
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    let id = '';

    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] || '';
    } else if (host.endsWith('youtube.com')) {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
};

export default function AudioPlayer() {

  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const matchedVideoId = searchParams.get('video');

  const navigate = useNavigate();

  const { user } = useAuth();

  const [videoId, setVideoId] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [isFavourite, setIsFavourite] =
    useState(false);

  const [isInLibrary, setIsInLibrary] =
    useState(false);

  const [review, setReview] =
    useState('');

  const [reviews, setReviews] =
    useState([]);

  const [book, setBook] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeUrlError, setYoutubeUrlError] = useState('');

  const youtubeSearchUrl = book
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${book.title} ${book.author} audiobook`)}`
    : '';

  useEffect(() => {
    // try local list first
    const local = audioBooks.find(b => b._id === id);
    if (local) {
      setBook(local);
      return;
    }

    // otherwise fetch from backend
    const loadRemote = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data?.book) setBook(res.data.book);
      } catch (err) {
        console.error('Failed to load book', err);
      }
    };

    loadRemote();
  }, [id]);

  useEffect(() => {

    const loadVideo = async () => {
      if (!book) return;

      try {
        // Reuse the exact video that made this book eligible on the list page.
        if (matchedVideoId) {
          setVideoId(matchedVideoId);
          return;
        }

        // Supports opening a bookmarked audiobook URL without a video parameter.
        const result = await searchAudiobook(book.title, book.author);
        if (result) setVideoId(result);
      } catch (err) {
        console.error('YouTube lookup failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();

  }, [book, matchedVideoId]);

  useEffect(() => {

    if (!book) return;

    const library =
  JSON.parse(
    localStorage.getItem('myLibrary')
  ) || [];

    const favourites =
      JSON.parse(
        localStorage.getItem('favourites')
      ) || [];

    setIsInLibrary(
      library.some(
        item => item._id === id
      )
    );

    setIsFavourite(
      favourites.some(
        item => item._id === id
      )
    );

    const storedReviews =
      JSON.parse(
        localStorage.getItem(
          `reviews-${book._id}`
        )
      ) || [];

    setReviews(storedReviews);

  }, [id, book]);

  const addToLibrary = () => {

  const library =
    JSON.parse(
      localStorage.getItem('myLibrary')
    ) || [];

  if (
    !library.some(
      item => item._id === book._id
    )
  ) {

    library.push({
      ...book,
      isAudioBook: true
    });

    localStorage.setItem(
      'myLibrary',
      JSON.stringify(library)
    );

    setIsInLibrary(true);
    toast.success('Added to library');

  }

};

  const removeFromLibrary = () => {

  let library =
    JSON.parse(
      localStorage.getItem('myLibrary')
    ) || [];

  library =
    library.filter(
      item =>
        item._id !== book._id
    );

  localStorage.setItem(
    'myLibrary',
    JSON.stringify(library)
  );

  setIsInLibrary(false);
  toast.success('Removed from library');

};

  const toggleFavourite = () => {

    const wasFav = isFavourite;

    let favourites =
      JSON.parse(
        localStorage.getItem(
          'favourites'
        )
      ) || [];

    if (isFavourite) {

      favourites =
        favourites.filter(
          item =>
            item._id !== book._id
        );

    } else {

      favourites.push({
        ...book,
        type: 'audio'
      });

    }

    localStorage.setItem(
      'favourites',
      JSON.stringify(favourites)
    );

    setIsFavourite(
      prev => !prev
    );
    toast.success(wasFav ? 'Removed from favourites' : 'Added to favourites');

  };

  const submitReview = () => {

  if (!review.trim()) return;

  const newReview = {

    name: user?.name || 'Anonymous',

    comment: review,

    date: new Date().toLocaleDateString()

  };

  const storedReviews =
    JSON.parse(
      localStorage.getItem(
        `reviews-${book._id}`
      )
    ) || [];

  const updatedReviews = [
    newReview,
    ...storedReviews
  ];

  localStorage.setItem(
    `reviews-${book._id}`,
    JSON.stringify(updatedReviews)
  );

  setReviews(updatedReviews);

  setReview('');
  toast.success('Review submitted');

};

// 👇 PLACE IT HERE (outside submitReview)
const deleteReview = (indexToDelete) => {

  if (!window.confirm('Delete this review?')) return;

  const updatedReviews = reviews.filter(
    (_, index) => index !== indexToDelete
  );

  localStorage.setItem(
    `reviews-${book._id}`,
    JSON.stringify(updatedReviews)
  );

  setReviews(updatedReviews);
  toast.success('Review deleted');

};

const playYouTubeUrl = (event) => {
  event.preventDefault();
  const id = getYouTubeVideoId(youtubeUrl);

  if (!id) {
    setYoutubeUrlError('Paste a valid YouTube video link or 11-character video ID.');
    return;
  }

  setYoutubeUrlError('');
  setVideoId(id);
};

if (!book) {

  return (

    <div className="text-center py-20">

      Audio book not found

    </div>

  );

}

  return (

    <div className="space-y-6">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500"
      >
        <HiArrowLeft />
        Back
      </button>

      <div className="card p-6">

        <div className="flex gap-6">

          <img
            src={book.coverImage}
            alt={book.title}
            className="w-52 rounded-xl"
          />

          <div>

            <h1 className="text-3xl font-bold">
              {book.title}
            </h1>

            <p className="text-gray-500 mt-2">
              {book.author}
            </p>

            <div className="flex gap-3 mt-4">

              {isInLibrary ? (

                <button
                  onClick={removeFromLibrary}
                  className="btn-outline"
                >
                  <HiTrash />
                  Remove
                </button>

              ) : (

                <button
                  onClick={addToLibrary}
                  className="btn-primary"
                >
                  <HiBookOpen />
                  Add to Library
                </button>

              )}

              <button
                onClick={
                  toggleFavourite
                }
                className="w-10 h-10 rounded-xl border flex items-center justify-center"
              >
                <HiHeart
                  className={
                    isFavourite
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }
                />
              </button>

            </div>

          </div>

        </div>

        <div className="mt-8">

          {loading ? (

            <div className="flex justify-center py-10">

              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />

            </div>

          ) : videoId ? (

            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={book.title}
              className="rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

          ) : (

            <div className="text-center py-10 text-gray-500">

              <p>No playable YouTube result was found automatically.</p>

              <p className="text-sm mt-2">
                Paste a YouTube video link below to play it here.
              </p>

              <form onSubmit={playYouTubeUrl} className="max-w-xl mx-auto mt-4 flex gap-2">
                <input
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  aria-label="YouTube video link"
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Play here
                </button>
              </form>

              {youtubeUrlError && (
                <p className="text-sm text-red-500 mt-2">{youtubeUrlError}</p>
              )}

              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm inline-block mt-4 hover:underline"
              >
                Find an audiobook on YouTube
              </a>

            </div>

          )}

        </div>

        <div className="mt-8 border-t pt-6">

          <h2 className="text-xl font-bold mb-4">
            Reviews
          </h2>

          <textarea
            value={review}
            onChange={e =>
              setReview(
                e.target.value
              )
            }
            placeholder="Write a review..."
            className="w-full border rounded-xl p-3"
            rows="3"
          />

          <button
            onClick={
              submitReview
            }
            className="btn-primary mt-3"
          >
            Submit Review
          </button>

          <div className="space-y-4 mt-6">

            {reviews.map((item, index) => (

                <div
  key={index}
  className="border-b pb-3 flex justify-between items-start"
>

  <div>

    <p className="font-semibold">

      {item.name}

    </p>

    <p className="text-gray-600">

      {item.comment}

    </p>

    <p className="text-xs text-gray-400 mt-1">

      {item.date}

    </p>

  </div>

  {item.name === (user?.name || 'Anonymous') && (

    <button

      onClick={() => deleteReview(index)}
      className="text-red-500 hover:text-red-700"

      title="Delete Review"

    >

      <HiOutlineTrash size={18} />

    </button>

  )}

</div>
))}


          </div>

        </div>

      </div>

    </div>

  );

}
