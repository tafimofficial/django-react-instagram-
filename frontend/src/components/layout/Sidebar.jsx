import { Home, Search, PlusSquare, MessageCircle, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col h-full p-4">
            <h1 className="text-2xl font-bold mb-8 px-4 mt-4 font-serif italic">SocialSphere</h1>

            <nav className="flex-1 space-y-2">
                <NavItem to="/" icon={<Home size={28} />} label="Home" />
                <NavItem to="/search" icon={<Search size={28} />} label="Search" />
                <NavItem to="/create" icon={<PlusSquare size={28} />} label="Create" />
                <NavItem to="/friends" icon={<Users size={28} />} label="Friends" />
                <NavItem to="/messages" icon={<MessageCircle size={28} />} label="Messages" />
                <NavItem to={`/profile/${user?.username}`} icon={<User size={28} />} label="Profile" />
            </nav>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink to={to} className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-brand-dark-lighter hover:shadow-neon group ${isActive ? 'bg-brand-dark-lighter shadow-neon border border-brand-green/30' : ''
            }`
        }>
            <div className={`transition-colors duration-300 group-hover:text-brand-green`}>{icon}</div>
            <span className={`text-lg transition-colors duration-300 group-hover:text-white ${window.location.pathname === to ? 'text-brand-green font-bold text-glow' : 'text-gray-400'}`}>{label}</span>
        </NavLink>
    );
}
