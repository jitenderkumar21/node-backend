// googleSheets.js

const { google } = require('googleapis');

const defaultTimeZone = async () => {
  try {
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1S0TqlZmzF-U2id7XsNnUXQxTPxqxMDqMez3RIhIZJf4';

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Sheet1!A:S', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var defaultTimeZone = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            var value = row[12];
            defaultTimeZone[classId] = value;
        });
      } else {
        console.log('No data found.');
      }
      console.log('defaultTimeZone',defaultTimeZone);
      return defaultTimeZone;


  } catch (err) {
    console.error('Error reading maxLearners from sheet', err);
  }
};

module.exports = defaultTimeZone;
