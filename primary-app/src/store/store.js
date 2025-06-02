import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import loggedInReducer from './loggedInSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loggedIn: loggedInReducer,
  },
});

export default store;
