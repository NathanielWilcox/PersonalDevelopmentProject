import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import ProtectedRoute from '../../Components/ProtectedRoute';
import authReducer from '../../store/authSlice';

describe('ProtectedRoute Component', () => {
    const TestComponent = () => <div>Protected Content</div>;

    const renderWithRedux = (component, initialState) => {
        const store = configureStore({
            reducer: {
                auth: authReducer
            },
            preloadedState: {
                auth: initialState
            }
        });

        return render(
            <Provider store={store}>
                <BrowserRouter>
                    {component}
                </BrowserRouter>
            </Provider>
        );
    };

    it('should render protected content when logged in', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>,
            initialState
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show loading state while authenticating', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: true,
            error: null
        };

        renderWithRedux(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>,
            initialState
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };

        const { container } = renderWithRedux(
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>,
            initialState
        );

        // Check that protected content is not rendered
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
