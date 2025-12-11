import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import NavBar from '../../Components/NavBar';
import authReducer from '../../store/authSlice';

describe('NavBar Component', () => {
    let mockNavigate;
    let mockDispatch;

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

    it('should render navigation links', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(<NavBar />, initialState);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('should display Profile link when logged in', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(<NavBar />, initialState);

        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should display Logout button when logged in', () => {
        const initialState = {
            isLoggedIn: true,
            user: { id: 1, username: 'testuser', role: 'user' },
            token: 'test-token',
            loading: false,
            error: null
        };

        renderWithRedux(<NavBar />, initialState);

        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should display Login button when not logged in', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };

        renderWithRedux(<NavBar />, initialState);

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should not display Profile link when not logged in', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };

        renderWithRedux(<NavBar />, initialState);

        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('should render navbar with correct styling class', () => {
        const initialState = {
            isLoggedIn: false,
            user: null,
            token: null,
            loading: false,
            error: null
        };

        const { container } = renderWithRedux(<NavBar />, initialState);
        const navbar = container.querySelector('nav.navbar');

        expect(navbar).toBeInTheDocument();
    });
});
