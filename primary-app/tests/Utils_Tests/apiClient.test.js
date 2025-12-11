import { getApiBaseUrl } from '../../utils/apiClient';

describe('API Client Utils', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return API base URL from environment variable', () => {
        process.env.REACT_APP_API_BASE_URL = 'http://api.example.com:8800';

        // Re-require to pick up new environment
        jest.resetModules();
        const { getApiBaseUrl } = require('../../utils/apiClient');

        const url = getApiBaseUrl();
        expect(url).toBe('http://api.example.com:8800');
    });

    it('should return localhost fallback when env var not set', () => {
        delete process.env.REACT_APP_API_BASE_URL;

        jest.resetModules();
        const { getApiBaseUrl } = require('../../utils/apiClient');

        const url = getApiBaseUrl();
        expect(url).toBe('http://localhost:8800');
    });

    it('should handle empty environment variable', () => {
        process.env.REACT_APP_API_BASE_URL = '';

        jest.resetModules();
        const { getApiBaseUrl } = require('../../utils/apiClient');

        const url = getApiBaseUrl();
        expect(url).toBe('http://localhost:8800');
    });
});
