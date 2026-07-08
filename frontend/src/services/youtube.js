import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
console.log("Loaded Key:", API_KEY);

export const searchAudiobook = async (title) => {
  try {
    console.log('Searching:', title);
    console.log('API KEY:', API_KEY);

    const res = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: `${title} audiobook`,
          maxResults: 5,
          type: 'video',
          key: API_KEY
        }
      }
    );

    console.log('YouTube Response:', res.data);

    const item = res.data.items?.[0];

    if (!item) return null;

    return item.id.videoId;

  } catch (error) {

    alert(
    JSON.stringify(
      error.response?.data,
      null,
      2
    )
  );

  return null;
  }
};