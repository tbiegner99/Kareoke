
import { chromium, FullConfig } from '@playwright/test';
import {runAllBuilds } from "./runAllBuilds"
async function globalSetup(config: FullConfig) {
  Object.assign(process.env, {
    BASE_URL: 'http://localhost'
  });

}

export default globalSetup;
