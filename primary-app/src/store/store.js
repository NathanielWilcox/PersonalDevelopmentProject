import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginSuccess, setHydrationComplete } from './authSlice';
import loggedInReducer from './loggedInSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loggedIn: loggedInReducer,
  },
});

// Hydrate auth state from localStorage on app startup
const hydrateAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    console.log('🔄 Hydrating auth from storage...');
    console.log('📦 Token from storage:', token ? token.substring(0, 20) + '...' : 'none');
    console.log('📦 User from storage:', userJson ? JSON.parse(userJson) : 'none');
    
    if (token && userJson) {
      const user = JSON.parse(userJson);
      store.dispatch(loginSuccess({ user, token }));
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
