import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiHeart,
  HiBookOpen,
  HiStar,
  HiOutlineTrash
} from 'react-icons/hi';

import { useBook } from '../hooks/useBooks';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

export default function BookDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user, refreshUser } = useAuth();

  const {
    book,
    loading,
    refetch: refetchBook,
  } = useBook(id);

  const [reviews, setReviews] = useState([]);

  const [myRating, setMyRating] = useState(0);

  const [myComment, setMyComment] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [inLibrary, setInLibrary] = useState(false);

  const isFav =
    user?.favourites?.some(
      f => (f._id || f) === id
    );

  useEffect(() => {

    const library =
      JSON.parse(
        localStorage.getItem('myLibrary')
      ) || [];

    const exists =
      library.some(
        item => item._id === id
      );

    setInLibrary(exists);

  }, [id]);

  useEffect(() => {
    if (!book) return;
    fetchReviews();
  }, [book]);

  const fetchReviews = async () => {
    if (!book?._id) return;
    try {
      const res = await api.get(`/reviews/book/${book._id}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  const refreshBook = async () => {
    if (!book?._id) return;
    try {
      const res = await api.get(`/books/${book._id}`);
      if (res.data.book) {
        setReviews((prev) => prev);
      }
    } catch (err) {
      console.error('Failed to refresh book:', err);
    }
  };

  const handleFav = async () => {

  try {

    const res = await api.put(
      `/users/favourites/${id}`
    );

    toast.success(res.data.message);

    await refreshUser();

    // Keep the local favourites cache in sync for settings and cards
    try {
      const favourites = JSON.parse(localStorage.getItem('favourites')) || [];
      const updatedFavourites = isFav
        ? favourites.filter(item => item._id !== id)
        : [...favourites, book];
      localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
    } catch (storageErr) {
      console.error('Favourite storage update failed:', storageErr);
    }

    // Try to create notification, but don't break favourite if it fails
    try {

      await api.post('/notifications', {

        title: '❤️ Favourite Added',

        message: `${book.title} was added to your favourites.`,

        type: 'favourite'

      });

    } catch (notificationError) {

      console.error(
        'Notification Error:',
        notificationError
      );

    }

  } catch (err) {

    console.error(err);

    toast.error(
      err.response?.data?.message ||
      err.message ||
      'Unable to update favourites'
    );

  }

};

  const handleAddToLibrary = async () => {

    const library =
      JSON.parse(
        localStorage.getItem('myLibrary')
      ) || [];

    const alreadyExists =
      library.find(
        item => item._id === book._id
      );

    if (alreadyExists) {
      toast.success('Book already in library');
      return;
    }

    library.push(book);

    localStorage.setItem(
      'myLibrary',
      JSON.stringify(library)
    );

    try {
      await api.post('/notifications', {
        title: '📚 Book Added',
        message: `${book.title} was added to your library.`,
        type: 'library'
      });

      window.dispatchEvent(new Event('notificationsChanged'));
    } catch (err) {
      console.log(err);
    }

    setInLibrary(true);
    toast.success('Added to library');
  };

  const handleRemoveFromLibrary = () => {

    const library =
      JSON.parse(
        localStorage.getItem('myLibrary')
      ) || [];

    const updatedLibrary =
      library.filter(
        item => item._id !== book._id
      );

    localStorage.setItem(
      'myLibrary',
      JSON.stringify(updatedLibrary)
    );

    setInLibrary(false);

    toast.success(
      'Removed from library'
    );
  };

  const submitReview = async (e) => {

    e.preventDefault();

    if (!myRating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      // Submit review
      await api.post(
        `/reviews/book/${book._id}`,
        {
          rating: myRating,
          title: '',
          comment: myComment
        }
      );

      // Reload latest reviews
      const reviewsRes = await api.get(`/reviews/book/${book._id}`);
      setReviews(reviewsRes.data.reviews);

      // Refresh book rating from backend
      await refetchBook();

      // Create notification
      await api.post('/notifications', {

      title: '⭐ Review Submitted',

      message: `You reviewed "${book.title}".`,

      type: 'review'

    });

    // Clear form
    setMyRating(0);

    setMyComment('');

    toast.success('Review submitted successfully');

    // Reload the page so all parts of the UI update consistently
    window.location.reload();

  } catch (err) {

    console.error(err);

    toast.error(

      err.response?.data?.message ||

      err.message ||

      'Unable to submit review'

    );

  } finally {

    setSubmitting(false);

  }

};

  const handleDeleteReview = async (reviewId) => {

  if (!window.confirm("Delete this review?")) return;

  try {

    await api.delete(`/reviews/${reviewId}`);

    await fetchReviews();
    await refetchBook();

    toast.success("Review deleted");

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      err.message ||
      "Unable to delete review"
    );

  }

};

  if (loading) {

    return (

      <div className="flex justify-center py-16">

        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  if (!book) {

    return (

      <div className="text-center py-20 text-gray-400">

        <p className="text-lg">
          Book not found
        </p>

      </div>
    );
  }

  const displayRating = book?.source === 'static' ? 0 : book.rating?.average || 0;
  const displayRatingCount = book?.source === 'static' ? 0 : book.rating?.count || 0;

  return (

    <div className="w-full max-w-full space-y-8">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
      >
        <HiArrowLeft />
        Back
      </button>

      {/* Book info */}

      <div className="card p-6 flex gap-8">

        <div className="w-44 h-64 rounded-2xl overflow-hidden bg-gray-100 shrink-0">

          {book.coverImage ? (

            <img
              src={book.coverImage}
              alt={book.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/280x420?text=No+Cover';
              }}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="w-full h-full flex items-center justify-center text-5xl">
              📚
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">

          <div>

            <div className="flex flex-wrap gap-1 mb-2">

              {book.categories?.map(c => (

                <span
                  key={c}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>

            <h1 className="font-display text-3xl font-bold text-navy leading-tight">
              {book.title}
            </h1>

            <p className="text-gray-500 mt-1">
              by
              {' '}
              <span className="text-primary font-medium">
                {book.author}
              </span>
            </p>

          </div>

          <div className="flex items-center gap-3">
            <StarRating
              rating={displayRating}
              size="md"
            />

            <span className="font-bold text-gray-700">
              {displayRating}
            </span>

            <span className="text-gray-400 text-sm">
              ({displayRatingCount} ratings)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">

            {[
              {
                label: 'Pages',
                value: book.pages || '—'
              },

              {
                label: 'Language',
                value: book.language
              },

              {
                label: 'Year',
                value:
                  book.publishedYear || '—'
              }

            ].map(({ label, value }) => (

              <div
                key={label}
                className="bg-surface rounded-xl p-3 text-center"
              >

                <p className="font-bold text-gray-800">
                  {value}
                </p>

                <p className="text-xs text-gray-400">
                  {label}
                </p>

              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <span className="text-lg font-bold text-green-500">
              Free
            </span>

            {!inLibrary ? (

              <button
                onClick={handleAddToLibrary}
                className="btn-primary"
              >
                <HiBookOpen />
                Add to Library
              </button>

            ) : (

              <button
                onClick={handleRemoveFromLibrary}
                className="btn-outline text-red-500 border-red-300 hover:bg-red-50"
              >
                <HiOutlineTrash />
                Remove from Library
              </button>
            )}

            {book.source === 'google' && (
              <button
                onClick={() => {
                  const library = JSON.parse(localStorage.getItem('staticDiscoverBooks')) || [];
                  const exists = library.some((item) => item._id === book._id);
                  if (exists) {
                    toast.success('Book already added to static discover');
                    return;
                  }

                  library.push({ ...book, source: 'google' });
                  localStorage.setItem('staticDiscoverBooks', JSON.stringify(library));
                  window.dispatchEvent(new Event('staticDiscoverChanged'));
                  toast.success('Added to static discover');
                }}
                className="btn-primary"
              >
                <HiPlus />
                Add to Static Discover
              </button>
            )}

            <button
              onClick={() => {

    if (!book.readUrl) {

      toast.error("Read link not available");
      return;

    }

    window.open(book.readUrl, "_blank");

  }}
  className="btn-outline"
>
              <HiBookOpen />
              Read Online
            </button>

          </div>
        </div>
      </div>

      {/* Reviews */}

      <div className="card p-6 space-y-6">

        <h2 className="font-display text-xl font-bold text-navy">
          Reviews
        </h2>

        <form
          onSubmit={submitReview}
          className="bg-surface rounded-2xl p-4 space-y-3"
        >

          <p className="text-sm font-medium text-gray-700">
            Write a Review
          </p>

          <StarRating
            rating={myRating}
            size="lg"
            onChange={setMyRating}
          />

          <textarea
            value={myComment}
            onChange={e =>
              setMyComment(e.target.value)
            }
            placeholder="Share your thoughts about this book..."
            rows={3}
            className="input resize-none"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Review'}
          </button>

        </form>

        {reviews.length === 0 ? (

          <p className="text-gray-400 text-sm text-center py-6">
            No reviews yet.
          </p>

        ) : (

          <div className="space-y-4">

            {reviews.map((r) => (

  <div
    key={r._id}
    className="flex gap-3 border-b border-gray-100 pb-4 last:border-0"
  >

    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
      {r.user?.name?.charAt(0).toUpperCase()}
    </div>

    <div className="flex-1">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="font-medium text-sm text-gray-800">
            {r.user?.name}
          </span>

          <StarRating
            rating={r.rating}
            size="sm"
          />

        </div>

        {(user?._id === (r.user?._id || r.user) ||
          user?.role === 'admin') && (

          <button
            onClick={() => handleDeleteReview(r._id)}
            className="text-red-500 hover:text-red-700"
            title="Delete Review"
          >
            <HiOutlineTrash size={18} />
          </button>

        )}

      </div>

      <p className="text-gray-600 text-sm mt-1">
        {r.comment}
      </p>

      <p className="text-xs text-gray-400 mt-1">

        {new Date(r.createdAt).toLocaleDateString()}

        {r.edited && (
          <span className="ml-2 italic text-primary">
            • Edited
          </span>
        )}

      </p>

    </div>

  </div>

))}
          </div>
        )}
      </div>
    </div>
  );
}