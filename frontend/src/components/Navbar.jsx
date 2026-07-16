import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSearch, HiBell, HiChevronDown } from 'react-icons/hi';
import api from '../services/api';

export default function Navbar() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsRef = useRef(null);

  const handleSearch = (e) => {

    e.preventDefault();

    if (search.trim()) {

      navigate(
        `/category?search=${encodeURIComponent(search.trim())}`
      );

    }

  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();

    const refreshNotifications = () => {
      fetchNotifications();
    };

    window.addEventListener('notificationsChanged', refreshNotifications);

    return () => {
      window.removeEventListener('notificationsChanged', refreshNotifications);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const markAllAsRead = async () => {

    try {

      await api.put('/notifications/read-all');

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true
        }))
      );

    } catch (err) {

      console.error(err);

    }

  };

  const unreadCount = notifications.filter(
    notification => !notification.read
  ).length;

  return (

    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">

      {/* Search */}

      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md relative"
      >

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

        {/* Notifications */}

        <div className="relative" ref={notificationsRef}>

          <button
            onClick={async () => {
              const newState = !showNotifications;
              setShowNotifications(newState);
              if (newState) {
                await markAllAsRead();
              }
            }}
            className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary/10 transition-colors"
          >

            <HiBell className="text-gray-500 text-lg" />

            {unreadCount > 0 && (

              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center">

                {unreadCount}

              </span>

            )}

          </button>

          {showNotifications && (

            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

              <div className="px-5 py-4 border-b bg-gray-50">

                <h3 className="font-semibold text-gray-800">

                  Notifications

                </h3>

              </div>

              <div className="max-h-96 overflow-y-auto">

                {notifications.length === 0 ? (

                  <div className="p-8 text-center text-gray-400">

                    🔔

                    <p className="mt-2">

                      No notifications yet

                    </p>

                  </div>

                ) : (

                  notifications.map(notification => (

                    <div
                      key={notification._id}
                      className={`px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 transition cursor-pointer ${
                        !notification.read
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >

                      <h4 className="font-medium text-sm text-gray-800">

                        {notification.title}

                      </h4>

                      <p className="text-sm text-gray-500 mt-1">

                        {notification.message}

                      </p>

                      <p className="text-xs text-gray-400 mt-2">

                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}

                      </p>

                    </div>

                  ))

                )}

              </div>

            </div>

          )}

        </div>

        {/* User */}

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 bg-gray-50 hover:bg-primary/5 rounded-full px-3 py-1.5 transition-colors"
        >

          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">

            {user?.name?.charAt(0).toUpperCase()}

          </div>

          <span className="text-sm font-medium text-gray-700">

            {user?.name?.split(' ')[0]}

          </span>

          <HiChevronDown className="text-gray-400 text-sm" />

        </button>

      </div>

    </header>

  );

}