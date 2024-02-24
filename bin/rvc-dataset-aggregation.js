#!/usr/bin/env node

const scraper = require('../src/scraper');
const cookieHandler = require('../src/cookieHandler');

// Example of parsing command-line arguments
const [,, command, ...args] = process.argv;

try {
  if (command === 'scrape') {
    // Assuming the first argument is the username and the rest are additional parameters
    const username = args[0];
    const additionalParams = args.slice(1);
    if (!username) {
      throw new Error('Username is required for scraping.');
    }
    scraper.scrape(username, additionalParams);
  } else if (command === 'fix-cookie') {
    // Assuming you expect the path to cookies.json as the first argument for fix-cookie command
    const cookieFilePath = args[0];
    if (!cookieFilePath) {
      throw new Error('Path to cookies.json is required.');
    }
    cookieHandler.fixCookie(cookieFilePath);
  } else {
    console.log('Unknown command');
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  // Optionally, provide usage information here on error
}