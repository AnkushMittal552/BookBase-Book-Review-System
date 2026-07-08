import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiHeart } from 'react-icons/hi';
import BookCard from '../components/BookCard';
import { audioBooks } from '../services/audioBooks';

export default function Favourite() {

  const navigate = useNavigate();

  const [favourites, setFavourites] =
    useState([]);

  useEffect(() => {

    const favs =
      JSON.parse(
        localStorage.getItem(
          'favourites'
        )
      ) || [];

    setFavourites(favs);

  }, []);

  const handleBookClick = (book) => {

    if (book.type === 'audio') {

    navigate(
      `/audio/${book._id}`
    );

  } else {

    navigate(
      `/book/${book._id}`
    );

  }

  };

  return (

    <div className="space-y-6">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">

          <HiHeart className="text-red-500 text-xl" />

        </div>

        <div>

          <h1 className="font-display text-2xl font-bold text-navy">
            Favourites
          </h1>

          <p className="text-gray-400 text-sm mt-0.5">
            {favourites.length} books you love
          </p>

        </div>

      </div>

      {favourites.length === 0 ? (

        <div className="flex flex-col items-center justify-center py-20 text-gray-400">

          <HiHeart className="text-6xl text-gray-200 mb-3" />

          <p className="text-lg font-medium">
            No favourites yet
          </p>

          <p className="text-sm">
            Tap the heart icon on any book to add it here
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

          {favourites.map(book => (

            <div
              key={book._id}
              onClick={() =>
                handleBookClick(book)
              }
              className="cursor-pointer"
            >

              <BookCard
                book={book}
              />

            </div>

          ))}

        </div>

      )}

    </div>

  );

}