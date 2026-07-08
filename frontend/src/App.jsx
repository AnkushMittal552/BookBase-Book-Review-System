import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Discover from './pages/Discover';
import Category from './pages/Category';
import MyLibrary from './pages/MyLibrary';
import Download from './pages/Download';
import AudioBooks from './pages/AudioBooks';
import AudioPlayer from './pages/AudioPlayer';
import Favourite from './pages/Favourite';
import Settings from './pages/Settings';
import Support from './pages/Support';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Discover />} />
        <Route path="category" element={<Category />} />
        <Route path="library" element={<MyLibrary />} />
        <Route path="downloads" element={<Download />} />
        <Route path="audio" element={<AudioBooks />} />

        {/* ADD THIS ROUTE */}
        <Route path="audio/:id" element={<AudioPlayer />} />

        <Route path="favourites" element={<Favourite />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<Support />} />
        <Route path="book/:id" element={<BookDetail />} />
      </Route>
    </Routes>
  );
}