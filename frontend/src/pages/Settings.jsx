import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiUser, HiLockClosed, HiPhotograph } from 'react-icons/hi';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [name, setName]       = useState(user?.name || '');
  const [avatar, setAvatar]   = useState(user?.avatar || '');
  const [saving, setSaving]   = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const totalBooksCount = Math.max(0, favoritesCount) + Math.max(0, libraryCount);

  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass]   = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const refreshCounts = () => {
    let storedFavourites = [];
    let storedLibrary = [];

    try {
      storedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
    } catch {
      storedFavourites = [];
    }

    try {
      storedLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
    } catch {
      storedLibrary = [];
    }

    const favCount = Array.isArray(storedFavourites)
      ? storedFavourites.length
      : 0;
    const libCount = Array.isArray(storedLibrary)
      ? storedLibrary.length
      : 0;

    setFavoritesCount(
      favCount || (Array.isArray(user?.favourites) ? user.favourites.length : 0)
    );
    setLibraryCount(
      libCount || (Array.isArray(user?.library) ? user.library.length : 0)
    );
  };

  useEffect(() => {
    refreshCounts();
  }, [user]);

  useEffect(() => {
    const handleStorage = () => refreshCounts();
    const handleFocus = () => refreshCounts();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', { name, avatar });
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: currPass, newPassword: newPass });
      toast.success('Password changed!');
      setCurrPass('');
      setNewPass('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-navy">Settings</h1>

      {/* Profile card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <HiUser className="text-primary text-xl" />
          <h2 className="font-semibold text-gray-800">Profile Information</h2>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Avatar URL</label>
            <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://…" className="input" />
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input value={user?.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <HiLockClosed className="text-primary text-xl" />
          <h2 className="font-semibold text-gray-800">Change Password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" value={currPass} onChange={e => setCurrPass(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="input" required minLength={6} />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary">
            {changingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Account Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Role', value: user?.role },
            { label: 'Favourites', value: favoritesCount },
            { label: 'Library Books', value: libraryCount },
            { label: 'Total Books saved in your Account', value: totalBooksCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface rounded-xl p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-semibold text-gray-800 capitalize mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
