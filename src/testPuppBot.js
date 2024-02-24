// Import puppeteer-extra and the stealth plugin
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add the stealth plugin to puppeteer-extra
puppeteer.use(StealthPlugin());

async function loadPage() {
  // Launch the browser in headful mode with puppeteer-extra
  const browser = await puppeteer.launch({ headless: false }); // headless set to false
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto('https://bot.sannysoft.com/');

  console.log('Page loaded');

  // No screenshot command

  // The browser will not automatically close since we want to see the page
  // You can manually close it, or add a timeout or browser.close() here if needed
}

loadPage().catch(error => console.error(error));
