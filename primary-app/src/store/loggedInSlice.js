import { createSlice } from '@reduxjs/toolkit';

const loggedInSlice = createSlice({
  name: 'loggedIn',
  initialState: {
    value: false,
  },
  reducers: {
    setLoggedIn(state, action) {
      state.value = action.payload;
    },
    logIn(state) {
      state.value = true;
    },
    logOut(state) {
      state.value = false;
    },
  },
});

export const { setLoggedIn, logIn, logOut } = loggedInSlice.actions;
export default loggedInSlice.reducer;