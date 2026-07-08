import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiMicrophone,
  HiPlay
} from 'react-icons/hi';

import api from '../services/api';
import { audioBooks } from '../services/audioBooks';
import StarRating from '../components/StarRating';

export default function AudioBooks() {

  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    api.get('/books?isAudio=true&limit=20')

      .then(res => {

        if (
          res.data.books &&
          res.data.books.length > 0
        ) {

          setBooks(res.data.books);

        } else {

          setBooks(audioBooks);

        }

      })

      .catch(() => {

        setBooks(audioBooks);

      })

      .finally(() => {

        setLoading(false);

      });

  }, []);

  if (loading)

    return (

      <div className="flex justify-center py-16">

        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />

      </div>

    );

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
            No audio books yet
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {books.map(book => (

            <div
              key={book._id}
              className="card p-4 flex gap-4 cursor-pointer group hover:shadow-hover transition-all"
              onClick={() =>
                navigate(`/audio/${book._id}`)
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