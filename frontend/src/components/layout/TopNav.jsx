import { Link, NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageCircle, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopNav() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-green/20 bg-brand-black/95 backdrop-blur-md text-white shadow-neon">
            <div className="w-full px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold font-serif italic text-white text-glow hover:text-brand-green transition-colors duration-300">
                    SocialSphere
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6">
                    <NavItem to="/" icon={<Home size={24} />} label="Home" />
                    <NavItem to="/search" icon={<Search size={24} />} label="Search" />
                    <NavItem to="/create" icon={<PlusSquare size={24} />} label="Create" />
                    <NavItem to="/friends" icon={<Users size={24} />} label="Friends" />
                    <NavItem to="/messages" icon={<MessageCircle size={24} />} label="Messages" />
                    <NavItem to={`/profile/${user?.username}`} icon={<User size={24} />} label="Profile" />
                    <button onClick={logout} className="p-2 hover:bg-brand-dark-lighter hover:text-red-500 rounded-full transition-colors" title="Logout">
                        <LogOut size={24} />
                    </button>
                </nav>
            </div>
        </header>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink to={to} className={({ isActive }) =>
            `p-2 rounded-lg transition-all duration-300 hover:bg-brand-dark-lighter hover:text-brand-green hover:shadow-neon ${isActive ? 'text-brand-green scale-110 drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]' : 'text-gray-400'
            }`
        } title={label}>
            {icon}
        </NavLink>
    );
}
