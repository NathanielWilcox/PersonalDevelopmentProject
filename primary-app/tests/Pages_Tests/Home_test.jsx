import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import Home from '../../Pages/Home';
import authReducer from '../../store/authSlice';

describe('Home Component', () => {
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

    it('should render home container', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        const { container } = renderWithRedux(<Home />, initialState);

        expect(container.querySelector('.home-container')).toBeInTheDocument();
    });

    it('should display welcome message', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(<Home />, initialState);

        expect(screen.getByText(/Welcome to the Creative Community/i)).toBeInTheDocument();
    });

    it('should display description text', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(<Home />, initialState);

        expect(
            screen.getByText(/Connect with artists, musicians, and other creatives/i)
        ).toBeInTheDocument();
    });

    it('should display message when user is not available', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };

        renderWithRedux(<Home />, initialState);

        expect(screen.getByText(/Please log in to access/i)).toBeInTheDocument();
    });
});
