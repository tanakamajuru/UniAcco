const { defineConfig } = require('playwright/test');
module.exports = defineConfig({
  testDir: '.',
  outputDir: './results',
  timeout: 60000,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure' },
});
