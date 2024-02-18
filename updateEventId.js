// googleSheets.js

const { google } = require('googleapis');
require('dotenv').config();

const updateEventId = async (index, newValue) => {
  try {
    
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = process.env.CLASSES_SHEET_ID;

    if (index!=undefined && newValue!=undefined) {
        // Update the cell in Google Sheets
  
        await  google.sheets({ version: 'v4', auth: client }).spreadsheets.values.update({
          auth,
          spreadsheetId,
          range: `Sheet1!V${index + 1}`, // Assuming row[22] is in column V
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[newValue]], // Provide the new value to be inserted
          },
        });
      }

  } catch (err) {
    console.error('Error saving eventid in google sheet', err);
  }
};

module.exports = updateEventId;
