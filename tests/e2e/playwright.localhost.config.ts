import type { PlaywrightTestConfig } from '@playwright/test';

import { devices } from '@playwright/test';

process.env.BASE_URL = 'http://localhost';
process.env.DOMAIN = 'http://localhost';
const MOBILE_TESTS = '**/tests/scenarios/**/*.mobile.spec.ts';
const DESKTOP_TESTS = '**/tests/scenarios/**/*.desktop.spec.ts';
 
const config: PlaywrightTestConfig = {
  testDir: 'tests/scenarios',
  testMatch: '*/**/*.ts',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000, //for email
  fullyParallel: false,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 15000,
  },
  globalSetup: require.resolve('./setup/localTests'),
  retries: 2,
  workers: 16,
  reporter: [['list']],
  use: {
    actionTimeout: 15000,
    baseURL: 'http://localhost',
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: 50,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testIgnore: MOBILE_TESTS,
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      testIgnore: MOBILE_TESTS,
    },

    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
      },
      testIgnore: MOBILE_TESTS,
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {
        channel: 'msedge',
      },
      testIgnore: MOBILE_TESTS,
    },
    {
      name: 'MobileChrome',
      use: {
        ...devices['Galaxy S9+'],
        browserName: 'chromium',
      },
      testIgnore: DESKTOP_TESTS,
    },
  ],
};

export default config;
