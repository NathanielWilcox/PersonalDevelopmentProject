import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    updateProfile,
    setHydrationComplete
} from '../../store/authSlice';

describe('Auth Slice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer
            }
        });
    });

    it('should return initial state', () => {
        const state = store.getState().auth;
        expect(state.isLoggedIn).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should handle loginStart', () => {
        store.dispatch(loginStart());
        const state = store.getState().auth;

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('should handle loginSuccess', () => {
        const payload = {
            user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' },
            token: 'test-token'
        };

        store.dispatch(loginSuccess(payload));
        const state = store.getState().auth;

        expect(state.isLoggedIn).toBe(true);
        expect(state.user).toEqual(payload.user);
        expect(state.token).toEqual(payload.token);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should handle loginFailure', () => {
        const errorMessage = 'Invalid credentials';
        store.dispatch(loginFailure(errorMessage));
        const state = store.getState().auth;

        expect(state.loading).toBe(false);
        expect(state.error).toEqual(errorMessage);
    });

    it('should handle logout', () => {
        // First login
        store.dispatch(loginSuccess({
            user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' },
            token: 'test-token'
        }));

        // Then logout
        store.dispatch(logout());
        const state = store.getState().auth;

        expect(state.isLoggedIn).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should handle updateProfile', () => {
        store.dispatch(loginSuccess({
            user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' },
            token: 'test-token'
        }));

        store.dispatch(updateProfile({ email: 'newemail@example.com' }));
        const state = store.getState().auth;

        expect(state.user.email).toBe('newemail@example.com');
        expect(state.user.username).toBe('testuser');
    });

    it('should handle setHydrationComplete', () => {
        store.dispatch(setHydrationComplete());
        const state = store.getState().auth;

        expect(state.loading).toBe(false);
    });
});
