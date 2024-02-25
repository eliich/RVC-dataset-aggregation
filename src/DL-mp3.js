const { exec } = require('child_process');
const PromisePool = require('@supercharge/promise-pool'); // Ensure you've installed this package

// Function to download a single video as MP3
function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    // Construct the yt-dlp command for downloading audio in MP3 format
    const command = `yt-dlp -x --audio-format mp3 ${url} -o "./audios/%(title)s.%(ext)s"`;

    // Execute the yt-dlp command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      console.log(`Audio Downloaded: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Function to manage downloading videos sequentially
async function downloadVideos(urls) {
  const { errors } = await PromisePool
    .withConcurrency(1) // Set concurrency to 1 for sequential downloads
    .for(urls)
    .process(async url => {
      return downloadVideo(url);
    });

  if (errors.length) {
    console.error("Errors occurred during downloads:", errors);
  }
}

module.exports = { downloadVideos };
