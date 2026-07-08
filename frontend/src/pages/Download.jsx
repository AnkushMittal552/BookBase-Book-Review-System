import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiDownload, HiBookOpen } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Download() {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/users/downloads')
      .then(res => setDownloads(res.data.downloads))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (bookId) => {
    try {
      const res = await api.get(`/books/${bookId}/download`);
      window.open(res.data.fileUrl, '_blank');
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Downloads</h1>
        <p className="text-gray-400 text-sm mt-1">{downloads.length} downloaded books</p>
      </div>

      {downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">📥</span>
          <p className="text-lg font-medium">No downloads yet</p>
          <p className="text-sm">Browse and download books from the Discover page</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Browse Books</button>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map(book => (
            <div key={book._id} className="card p-4 flex items-center gap-4 hover:shadow-hover transition-all cursor-pointer">
              <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {book.coverImage
                  ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                }
              </div>
              <div className="flex-1 min-w-0" onClick={() => navigate(`/book/${book._id}`)}>
                <p className="font-semibold text-gray-800 truncate">{book.title}</p>
                <p className="text-sm text-gray-400">{book.author}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {book.categories?.map(c => (
                    <span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleDownload(book._id)} className="btn-primary shrink-0">
                <HiDownload /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
