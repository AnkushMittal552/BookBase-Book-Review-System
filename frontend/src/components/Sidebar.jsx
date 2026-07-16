import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiHome,
  HiBookOpen,
  HiLibrary,
  HiMicrophone,
  HiHeart,
  HiCog,
  HiSupport,
  HiLogout
} from 'react-icons/hi';

const links = [
  { to: '/',           label: 'Discover',    icon: HiHome },
  { to: '/category',   label: 'Category',    icon: HiBookOpen },
  { to: '/library',    label: 'My Library',  icon: HiLibrary },
  { to: '/audio',      label: 'Audio Books', icon: HiMicrophone },
  { to: '/favourites', label: 'Favourite',   icon: HiHeart },
];

const bottom = [
  { to: '/settings', label: 'Settings', icon: HiCog },
  { to: '/support',  label: 'Support',  icon: HiSupport },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <HiBookOpen className="text-white text-lg" />
        </div>
        <span className="font-display font-bold text-xl text-navy">
          BookBase
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-1 border-t border-gray-100 pt-4">
        {bottom.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="sidebar-link w-full text-left text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <HiLogout className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
}