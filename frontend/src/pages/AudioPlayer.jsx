import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiHeart,
  HiBookOpen,
  HiTrash
} from 'react-icons/hi';

import { audioBooks } from '../services/audioBooks';
import { searchAudiobook } from '../services/youtube';
import { useAuth } from '../context/AuthContext';

export default function AudioPlayer() {

  const { id } = useParams();

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

  const book = audioBooks.find(
    b => b._id === id
  );

  useEffect(() => {

    const loadVideo = async () => {

      if (!book) return;

      const result =
        await searchAudiobook(
          book.title
        );

      if (result) {
        setVideoId(result);
      }

      setLoading(false);

    };

    loadVideo();

  }, [book]);

  useEffect(() => {

    if (!book) return;

    const library =
      JSON.parse(
        localStorage.getItem('library')
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
        localStorage.getItem('library')
      ) || [];

    if (
      !library.some(
        item => item._id === book._id
      )
    ) {

      library.push({
        ...book,
        type: 'audio'
      });

      localStorage.setItem(
        'library',
        JSON.stringify(library)
      );

      setIsInLibrary(true);

    }

  };

  const removeFromLibrary = () => {

    let library =
      JSON.parse(
        localStorage.getItem('library')
      ) || [];

    library =
      library.filter(
        item =>
          item._id !== book._id
      );

    localStorage.setItem(
      'library',
      JSON.stringify(library)
    );

    setIsInLibrary(false);

  };

  const toggleFavourite = () => {

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

  };

  const submitReview = () => {

    if (!review.trim()) return;

    const newReview = {

      name:
        user?.name ||
        'Anonymous',

      comment: review,

      date:
        new Date()
          .toLocaleDateString()

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
      JSON.stringify(
        updatedReviews
      )
    );

    setReviews(
      updatedReviews
    );

    setReview('');

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

              No audiobook found on YouTube

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

            {reviews.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="border-b pb-3"
                >

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

              )
            )}

          </div>

        </div>

      </div>

    </div>

  );

}