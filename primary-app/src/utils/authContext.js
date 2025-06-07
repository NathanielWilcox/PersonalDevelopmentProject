import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogin, handleLogout } from './authActions';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = null; // Set this if you want to use navigation in context
  const authState = useSelector((state) => state.auth);

  const login = (userData, nav) => handleLogin(dispatch, userData, nav || navigate);
  const logout = (onLogout) => handleLogout(dispatch, onLogout);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
