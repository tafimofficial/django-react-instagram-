import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen bg-brand-black text-white">
            {/* Top Navigation */}
            <TopNav />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative no-scrollbar">
                <div className="w-full h-full pb-16 md:pb-0">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 w-full border-t border-brand-green/20 bg-brand-black/95 backdrop-blur-xl z-50">
                <BottomNav />
            </div>
        </div>
    );
}
