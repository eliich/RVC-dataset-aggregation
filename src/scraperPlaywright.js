// Import Playwright
const { firefox } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Import the configuration
const { tiktokCookies, contentSelector } = require('../config.json');

async function scrape(username, additionalParams) {
  const startTime = Date.now(); // Capture start time
  console.log(`Starting scrape operation. Username: ${username || 'N/A'}`);

  // Launch Firefox browser
  const browser = await firefox.launch({ headless: false });
  const page = await browser.newPage();

  // Load and set cookies
  await preloadCookies(page, tiktokCookies);

  // Use the username in the URL
  const url = `https://www.tiktok.com/${username}`;
  console.log(`Navigating to URL: ${url}`);
  await page.goto(url);

  // Wait for the element matching the selector to appear on the page
  await page.waitForSelector(`${contentSelector} a`);

  // Extract the href attribute of the first <a> element within the specified parent class
  const href = await page.$eval(`${contentSelector} a`, el => el.href);
  console.log(`First <a> element href: ${href}`);

  // Close the browser
  await browser.close();
  console.log('Browser closed after visiting the specified TikTok profile.');

  const endTime = Date.now(); // Capture end time
  const duration = (endTime - startTime) / 1000; // Calculate duration in seconds
  console.log(`Scrape operation completed in ${duration} seconds.`);
}

async function preloadCookies(page, cookiesPath) {
  const cookiesFilePath = path.resolve(cookiesPath);
  const cookiesString = await fs.readFile(cookiesFilePath, 'utf8');
  const cookies = JSON.parse(cookiesString);
  await page.context().addCookies(cookies.map(cookie => ({
    ...cookie,
    domain: cookie.domain,
    path: cookie.path,
    name: cookie.name,
    value: cookie.value,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    expires: cookie.expires
  })));
}

module.exports = { scrape };
