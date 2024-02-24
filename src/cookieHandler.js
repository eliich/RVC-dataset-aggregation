const fs = require('fs');

function fixCookie(filePath) {
    if (!filePath) {
        throw new Error('Path to cookies.json is required.');
    }
    try {
        const cookiesRaw = fs.readFileSync(filePath, 'utf8');
        let cookies = JSON.parse(cookiesRaw);

        cookies.forEach(cookie => {
            if (!['Strict', 'Lax', 'None'].includes(cookie.sameSite)) {
                cookie.sameSite = 'None'; // Ensure the correct sameSite value
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2)); // Save the modified cookies
        console.log('Cookies have been modified successfully.');
    } catch (e) {
        console.error(`An error occurred: ${e}`);
        throw e; // Allows the calling function to handle the error
    }
}

module.exports = { fixCookie };
