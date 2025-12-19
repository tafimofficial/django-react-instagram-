import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import api from '../../api/axios';
import PostCard from './PostCard';

export default function Feed() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await api.get(`posts/?page=${pageParam}`);
            return res.data;
        },
        getNextPageParam: (lastPage, allPages) => {
            // DRF default pagination returns { count, next, previous, results }
            if (lastPage.next) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });

    const loadMoreRef = useRef(null);
    const isInView = useInView(loadMoreRef);

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isInView, hasNextPage, fetchNextPage]);

    if (status === 'pending') return <div className="text-white text-center p-4">Loading feed...</div>;
    if (status === 'error') return <div className="text-red-500 text-center p-4">Error loading feed</div>;

    return (
        <div className="flex flex-col items-center space-y-6 w-full max-w-2xl mx-auto pb-20">
            {data?.pages?.map((group, i) => (
                group?.results?.map((post) => (
                    <div key={post.id} className="w-full">
                        <PostCard post={post} />
                    </div>
                ))
            ))}

            {/* Sentinel for infinite scroll */}
            <div ref={loadMoreRef} className="h-10 w-full flex justify-center py-4">
                {isFetchingNextPage && (
                    <div className="w-8 h-8 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin shadow-neon"></div>
                )}
            </div>
        </div>
    );
}
