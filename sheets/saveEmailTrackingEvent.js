const { google } = require('googleapis');
require('dotenv').config();

const saveEmailTrackingEvent = async (data) => {
  try {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
  
      // Create client instance for auth
      const client = await auth.getClient();
  
      const spreadsheetId = process.env.RESPONSE_SHEET_ID;
  
      // Write rows to spreadsheet
      await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Email-Tracking!A:P', // Adjust the range as needed
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: data,
        },
      });

    console.log('Data saved to Email-Tracking Sheets successfully');
  } catch (error) {
    console.error('Error saving data to Email-Tracking Sheets:', error);
  }
};

module.exports = saveEmailTrackingEvent;
