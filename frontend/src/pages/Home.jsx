import Feed from '../components/feed/Feed';
import StoryTray from '../components/feed/StoryTray';

export default function Home() {
    return (
        <div className="flex flex-col min-h-full">
            {/* Stories Section */}
            <div className="w-full bg-brand-black/50 backdrop-blur-md border-b border-brand-green/20 sticky top-0 z-10 shadow-neon">
                <StoryTray />
            </div>

            {/* Feed Section - Full Width Grid */}
            <div className="flex-1 p-2 md:p-4">
                <div className="max-w-[2000px] mx-auto">
                    <Feed />
                </div>
            </div>
        </div>
    );
}
