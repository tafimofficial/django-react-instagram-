import { Home, Search, PlusSquare, MessageCircle, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
    const { user } = useAuth();

    return (
        <nav className="flex justify-around items-center h-16 bg-transparent text-white w-full">
            <NavItem to="/" icon={<Home size={24} />} />
            <NavItem to="/search" icon={<Search size={24} />} />
            <NavItem to="/create" icon={<PlusSquare size={24} />} />
            <NavItem to="/friends" icon={<Users size={24} />} />
            <NavItem to="/messages" icon={<MessageCircle size={24} />} />
            <NavItem to={`/profile/${user?.username}`} icon={<User size={24} />} />
        </nav>
    );
}

function NavItem({ to, icon }) {
    return (
        <NavLink to={to} className={({ isActive }) =>
            `p-3 rounded-full transition-all duration-300 ${isActive ? 'text-brand-green bg-brand-dark-lighter shadow-neon scale-110' : 'text-gray-500 hover:text-white'}`
        }>
            {icon}
        </NavLink>
    );
}
