// Import puppeteer-extra and the stealth plugin
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

// Import the downloadVideos function from DL-mp3.js
const { downloadVideos } = require('./DL-mp3');

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

// Import the configuration
const { tiktokCookies, contentSelector } = require('../config.json');

// Function to preload cookies
async function preloadCookies(page, cookiesPath) {
  const cookiesFilePath = path.resolve(cookiesPath);
  const cookiesString = await fs.readFile(cookiesFilePath, 'utf8');
  const cookies = JSON.parse(cookiesString);
  for (const cookie of cookies) {
    await page.setCookie(cookie);
  }
}

// Function to wait for a specified amount of time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main scrape function
async function scrape(username, additionalParams) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Load and set cookies
  await preloadCookies(page, tiktokCookies);

  // Navigate to the user's TikTok page
  const url = `https://www.tiktok.com/@${username}`;
  await page.goto(url);

  // Wait for the first element specified by contentSelector to load
  await page.waitForSelector(contentSelector);

  let uniqueHrefs = new Set();
  let tries = 0;
  let lastHrefsSize = 0;

  // Attempt to press the "End" key until no new videos are found after several tries
  while (tries < 3) {
    // Simulate pressing the "End" key
    await page.keyboard.press('End');

    // Wait for the dynamic content to load
    await wait(2000); // Adjust this delay based on observed load times and network speed

    // Extract video URLs found on the page after scrolling
    const hrefs = await page.$$eval(`${contentSelector} a`, links => links.map(link => link.href));
    hrefs.forEach(href => uniqueHrefs.add(href));

    // Check if new videos were added
    if (uniqueHrefs.size > lastHrefsSize) {
      lastHrefsSize = uniqueHrefs.size;
      tries = 0; // Reset tries if new content was found
    } else {
      tries++; // Increment tries if no new content was found
    }
  }

  console.log(`Total videos found for @${username}: ${uniqueHrefs.size}`);
  uniqueHrefs.forEach(href => console.log(href));

  // Close the browser before starting downloads
  await browser.close();

  // Convert Set to Array to download videos
  const urlsArray = Array.from(uniqueHrefs);
  await downloadVideos(urlsArray);
}

module.exports = { scrape };
