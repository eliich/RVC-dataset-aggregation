// Import puppeteer-extra and the stealth plugin
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

// Import the configuration
const { tiktokCookies, contentSelector } = require('../config.json');

async function scrape(username, additionalParams) {
  console.log(`Starting scrape operation. Username: ${username || 'N/A'}`);

  const startTime = Date.now(); // Capture start time

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Load and set cookies
  await preloadCookies(page, tiktokCookies);

  // Prepare to listen for the response before navigating
  const responsePromise = page.waitForResponse(response =>
    response.url().startsWith('https://www.tiktok.com/api/comment/list/') && response.status() === 200,
    { timeout: 60000 } // Adjust as necessary
  );

  // Now navigate to the page
  const url = `https://www.tiktok.com/@${username}`; // Directly use the provided username
  console.log(`Navigating to URL: ${url}`);
  await page.goto(url);

  // Wait for the page to load necessary elements
  await page.waitForSelector(`${contentSelector} a`);

  const hrefs = await page.$$eval(`${contentSelector} a`, links => links.map(link => link.href));
  console.log(`Found ${hrefs.length} links. Navigating to each link...`);

  for (const href of hrefs) {
    console.log(`Navigating to ${href}`);
    await page.goto(href);

    // Now, wait for the response we started listening for earlier
    const responseReceived = await responsePromise;
    if (responseReceived) {
      console.log(`Comments API response received for ${href}`);
    } else {
      console.log(`No Comments API response or timeout for ${href}`);
    }

    // Use standard JavaScript setTimeout to wait a bit before navigating to the next link
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  console.log(`Scrape operation completed in ${duration} seconds.`);
}

async function preloadCookies(page, cookiesPath) {
  const cookiesFilePath = path.resolve(cookiesPath);
  const cookiesString = await fs.readFile(cookiesFilePath, 'utf8');
  const cookies = JSON.parse(cookiesString);
  for (const cookie of cookies) {
    await page.setCookie(cookie);
  }
}

module.exports = { scrape };
