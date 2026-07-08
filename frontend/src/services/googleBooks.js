import axios from 'axios';

export const searchBooks = async (
  query = 'programming'
) => {

  try {

    const res = await axios.get(
      `https://openlibrary.org/search.json?q=${query}&limit=40`
    );

    return (res.data.docs || []).map((book, index) => ({

      _id: String(index + 1),

      title:
        book.title || 'Unknown Title',

      author:
        book.author_name?.join(', ') ||
        'Unknown Author',

      description:
        book.first_sentence?.[0] ||
        'No description available',

      category:
        book.subject?.[0] || 'General',

      coverImage: book.cover_i

        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`

        : `https://picsum.photos/300/450?random=${index + 1}`,

      pages:
        book.number_of_pages_median || 0,

      rating: {

        average:
          Math.floor(Math.random() * 2) + 4,

        count:
          Math.floor(Math.random() * 5000)
      },

      // Read only
      readUrl: book.key

        ? `https://openlibrary.org${book.key}`

        : `https://openlibrary.org/search?q=${encodeURIComponent(
            book.title || ''
          )}`,

      previewUrl: book.ia?.[0]

        ? `https://archive.org/details/${book.ia[0]}`

        : null,

      language:
        book.language?.[0] || 'English',

      publishedYear:
        book.first_publish_year || 'Unknown'

    }));

  } catch (error) {

    console.log(error);

    return [];
  }
};