// googleSheets.js

const { google } = require('googleapis');
require('dotenv').config();


const inviteInfo = async () => {
  try {
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = process.env.CLASSES_SHEET_ID;

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Sheet1!A:W', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var inviteInfo = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            var value = [row[1],row[19],row[20],row[21],rows.indexOf(row),row[16]];
            inviteInfo[classId] = value;
        });
      } else {
        console.log('No data found.');
      }

      return inviteInfo;


  } catch (err) {
    console.error('Error reading inviteInfo from sheet', err);
  }
};

module.exports = inviteInfo;
