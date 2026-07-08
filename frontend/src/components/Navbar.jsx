import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSearch, HiBell } from 'react-icons/hi';
import { HiChevronDown } from 'react-icons/hi';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/category?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search your favourite books"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </form>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary/10 transition-colors">
          <HiBell className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 bg-gray-50 hover:bg-primary/5 rounded-full px-3 py-1.5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
          <HiChevronDown className="text-gray-400 text-sm" />
        </button>
      </div>
    </header>
  );
}
