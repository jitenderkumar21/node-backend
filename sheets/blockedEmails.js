// googleSheets.js

const { google } = require('googleapis');

const blockedEmails = async () => {
  try {
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1PEWxWS0HzyFgwMdOTktj9eh8o0WQS2z7azKHs5zMjk4';

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Block List!A:B', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      let blockedEmails = new Set();

        if (rows.length) {
            rows.slice(1).forEach((row) => {
                const email = row[1] ? row[1].trim() : null;
                if (email) {
                    blockedEmails.add(email);
                }
            });
        }
    return blockedEmails;

  } catch (err) {
    console.error('Error reading maxLearners from sheet', err);
  }
};

module.exports = blockedEmails;
