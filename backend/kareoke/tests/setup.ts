import axios from 'axios';

// Global test setup
beforeAll(() => {
    // Set default timeout for axios requests
    axios.defaults.timeout = 10000;

    // Set default base URL from environment variable
    const baseUrl = process.env.TEST_API_BASE_URL || 'http://localhost:3000';
    axios.defaults.baseURL = baseUrl;

    console.log(`Running tests against: ${baseUrl}`);
});

afterAll(() => {
    // Cleanup if needed
});
