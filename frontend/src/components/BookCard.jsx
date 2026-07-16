import { useNavigate } from 'react-router-dom';
import { HiHeart, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function BookCard({ book, showFavBtn = true, showRating = true }) {

  const navigate = useNavigate();

  const [isFav, setIsFav] =
    useState(false);

  useEffect(() => {

    const favourites =
      JSON.parse(
        localStorage.getItem(
          'favourites'
        )
      ) || [];

    setIsFav(
      favourites.some(
        item =>
          item._id === book._id
      )
    );

  }, [book]);

  const placeholderCover = 'https://via.placeholder.com/400x600?text=No+Cover';

  const handleFav = (e) => {

    e.stopPropagation();

    let favourites =
      JSON.parse(
        localStorage.getItem(
          'favourites'
        )
      ) || [];

    if (isFav) {

      favourites =
        favourites.filter(
          item =>
            item._id !== book._id
        );

      toast.success(
        'Removed from favourites'
      );

    } else {

      favourites.push(book);

      toast.success(
        'Added to favourites'
      );

    }

    localStorage.setItem(
      'favourites',
      JSON.stringify(favourites)
    );

    setIsFav(!isFav);

  };

  return (

    <div
      onClick={() =>
        navigate(
          `/book/${encodeURIComponent(
            book._id
          )}`
        )
      }
      className="card p-3 cursor-pointer group relative"
    >

      <div className="relative overflow-hidden rounded-xl mb-3 aspect-[3/4] bg-gray-100">

        {book.coverImage ? (

          <img
            src={book.coverImage}
            alt={book.title}
            onError={(e) => {
              if (e.currentTarget.src !== placeholderCover) {
                e.currentTarget.src = placeholderCover;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-navy/20">

            <span className="text-4xl">
              📚
            </span>

          </div>

        )}

        {showRating && book.rating?.average > 0 && (

          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-1">

            <HiStar className="text-xs" />

            {book.rating.average}

          </div>

        )}

        {showFavBtn && (

          <button
            onClick={handleFav}
            className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all
            ${
              isFav
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-400 hover:text-red-500'
            }`}
          >

            <HiHeart className="text-sm" />

          </button>

        )}

      </div>

      <div>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">

          {book.title}

        </h3>

        <p className="text-xs text-gray-500 mt-1 truncate">

          {book.author}

        </p>

        {(book.category || book.categories?.[0]) && (

          <p className="text-[11px] text-primary mt-1 font-medium">

            {book.category || book.categories?.[0]}

          </p>

        )}

        

      </div>

    </div>

  );

}