import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, resetFeed } from '../store/postsSlice';
import PostCard from './PostCard';
import './PostsFeed.css';

const PostsFeed = ({ filters }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const { posts, page, limit, hasMore, loading, error } = useSelector(
        state => state.posts.feed
    );

    const observerTarget = useRef(null);
    const observerRef = useRef(null);

    // Fetch posts on component mount or when filters change
    useEffect(() => {
        dispatch(resetFeed());
        dispatch(fetchFeedPosts({
            page: 1,
            limit: 10,
            filterBy: filters.filterBy,
            mediaType: filters.mediaType,
            sort: filters.sort,
            token
        }));
    }, [filters, token, dispatch]);

    // Load more posts function
    const loadMorePosts = useCallback(() => {
        if (hasMore && !loading) {
            dispatch(fetchFeedPosts({
                page: page + 1,
                limit,
                filterBy: filters.filterBy,
                mediaType: filters.mediaType,
                sort: filters.sort,
                token
            }));
        }
    }, [hasMore, loading, page, limit, filters, token, dispatch]);

    // Setup Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMorePosts]);

    if (error) {
        return (
            <div className="feed-error">
                <p>❌ Error loading feed: {error}</p>
                <button onClick={() => dispatch(resetFeed())}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="posts-feed">
            {posts.length === 0 && !loading ? (
                <div className="feed-empty">
                    <p>No posts available</p>
                    <small>Check back later for more content!</small>
                </div>
            ) : (
                <>
                    {posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={() => {
                                // Post already removed from Redux on delete
                            }}
                        />
                    ))}
                </>
            )}

            {/* Intersection Observer target for infinite scroll */}
            {hasMore && (
                <div ref={observerTarget} className="observer-target">
                    {loading && (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            <p>Loading more posts...</p>
                        </div>
                    )}
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="feed-end">
                    <p>No more posts to load</p>
                </div>
            )}
        </div>
    );
};

export default PostsFeed;
