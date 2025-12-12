import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '../utils/apiClient';

/**
 * Async thunk to fetch feed posts with pagination and filters
 */
export const fetchFeedPosts = createAsyncThunk(
    'posts/fetchFeedPosts',
    async ({ page = 1, limit = 10, filterBy = 'all', mediaType = 'all', sort = 'newest', token }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page,
                limit,
                filter_by: filterBy,
                media_type: mediaType,
                sort
            });

            const response = await fetch(`${getApiBaseUrl()}/api/posts/feed?${params}`, {
                method: 'GET',
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error?.message || 'Failed to fetch feed');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to create a new post with file upload
 */
export const createPost = createAsyncThunk(
    'posts/createPost',
    async ({ formData, token }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/posts`, {
                method: 'POST',
                credentials: 'include',  // Include HTTP-only cookies
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error?.message || 'Failed to create post');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to delete a post
 */
export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async ({ postId, token }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error?.message || 'Failed to delete post');
            }

            return { postId, message: 'Post deleted successfully' };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to fetch a single post by ID
 */
export const fetchPostById = createAsyncThunk(
    'posts/fetchPostById',
    async ({ postId, token }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/posts/${postId}`, {
                method: 'GET',
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error?.message || 'Failed to fetch post');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Async thunk to fetch user's posts
 */
export const fetchUserPosts = createAsyncThunk(
    'posts/fetchUserPosts',
    async ({ userId, page = 1, limit = 10, token }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, limit });
            const response = await fetch(`${getApiBaseUrl()}/api/posts/user/${userId}?${params}`, {
                method: 'GET',
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error?.message || 'Failed to fetch user posts');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        // Feed data
        feed: {
            posts: [],
            page: 1,
            limit: 10,
            total: 0,
            hasMore: true,
            loading: false,
            error: null
        },
        // Single post view
        currentPost: {
            data: null,
            loading: false,
            error: null
        },
        // User posts
        userPosts: {
            posts: [],
            page: 1,
            limit: 10,
            total: 0,
            hasMore: true,
            loading: false,
            error: null
        },
        // Create post form
        createPostForm: {
            loading: false,
            error: null,
            success: false
        },
        // Filters
        filters: {
            filterBy: 'all',
            mediaType: 'all',
            sort: 'newest'
        }
    },
    reducers: {
        // Reset feed for new filter/sort changes
        resetFeed: (state) => {
            state.feed = {
                posts: [],
                page: 1,
                limit: 10,
                total: 0,
                hasMore: true,
                loading: false,
                error: null
            };
        },
        // Update filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        // Clear create post success message
        clearCreatePostSuccess: (state) => {
            state.createPostForm.success = false;
        },
        // Clear errors
        clearError: (state, action) => {
            const target = action.payload || 'feed';
            if (target === 'feed') state.feed.error = null;
            if (target === 'create') state.createPostForm.error = null;
            if (target === 'currentPost') state.currentPost.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Feed Posts
        builder
            .addCase(fetchFeedPosts.pending, (state) => {
                state.feed.loading = true;
                state.feed.error = null;
            })
            .addCase(fetchFeedPosts.fulfilled, (state, action) => {
                state.feed.loading = false;
                state.feed.posts = action.payload.posts;
                state.feed.page = action.payload.page;
                state.feed.total = action.payload.total;
                state.feed.hasMore = action.payload.hasMore;
            })
            .addCase(fetchFeedPosts.rejected, (state, action) => {
                state.feed.loading = false;
                state.feed.error = action.payload;
            });

        // Create Post
        builder
            .addCase(createPost.pending, (state) => {
                state.createPostForm.loading = true;
                state.createPostForm.error = null;
                state.createPostForm.success = false;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.createPostForm.loading = false;
                state.createPostForm.success = true;
                // Add new post to beginning of feed
                state.feed.posts.unshift({
                    id: action.payload.postId,
                    title: 'New post',
                    created_at: new Date().toISOString()
                });
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createPostForm.loading = false;
                state.createPostForm.error = action.payload;
            });

        // Delete Post
        builder
            .addCase(deletePost.pending, (state) => {
                state.feed.loading = true;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.feed.loading = false;
                state.feed.posts = state.feed.posts.filter(p => p.id !== action.payload.postId);
                state.feed.total -= 1;
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.feed.loading = false;
                state.feed.error = action.payload;
            });

        // Fetch Single Post
        builder
            .addCase(fetchPostById.pending, (state) => {
                state.currentPost.loading = true;
                state.currentPost.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.currentPost.loading = false;
                state.currentPost.data = action.payload;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.currentPost.loading = false;
                state.currentPost.error = action.payload;
            });

        // Fetch User Posts
        builder
            .addCase(fetchUserPosts.pending, (state) => {
                state.userPosts.loading = true;
                state.userPosts.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.userPosts.loading = false;
                state.userPosts.posts = action.payload.posts;
                state.userPosts.page = action.payload.page;
                state.userPosts.total = action.payload.total;
                state.userPosts.hasMore = action.payload.hasMore;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.userPosts.loading = false;
                state.userPosts.error = action.payload;
            });
    }
});

export const {
    resetFeed,
    setFilters,
    clearCreatePostSuccess,
    clearError
} = postsSlice.actions;

export default postsSlice.reducer;
