import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginSuccess, setHydrationComplete } from './authSlice';
import loggedInReducer from './loggedInSlice';
import postsReducer from './postsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loggedIn: loggedInReducer,
    posts: postsReducer
  },
});

// Hydrate auth state from localStorage on app startup
const hydrateAuthFromStorage = () => {
  try {
    const userJson = localStorage.getItem('user');
    
    console.log('🔄 Hydrating auth from storage...');
    console.log('📦 User from storage:', userJson ? JSON.parse(userJson) : 'none');
    console.log('📦 Token stored in HTTP-only cookie (not accessible to JavaScript)');
    
    if (userJson) {
      const user = JSON.parse(userJson);
      store.dispatch(loginSuccess({ user, token: null }));
      console.log('✅ Auth hydrated successfully');
    } else {
      console.log('⚠️ No stored auth data found');
    }
  } catch (err) {
    console.error('❌ Failed to hydrate auth from storage:', err);
  } finally {
    // Mark hydration as complete (stops loading indicator)
    store.dispatch(setHydrationComplete());
    console.log('✅ Hydration complete - app ready');
  }
};

hydrateAuthFromStorage();

export default store;
