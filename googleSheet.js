// googleSheets.js

const { google } = require('googleapis');

const googleSheets = async (personDetails) => {
  try {
    
    console.log(personDetails);
    const values = [personDetails.parentName, personDetails.childName,personDetails.email, personDetails.childAge,personDetails.classDetails[0].timeslot,personDetails.classDetails[1].timeslot,personDetails.classDetails[2].timeslot];
    console.log('values');
    console.log(values);
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '17GklRP73wG7dALq98qjtNrH_N_igeWc52i-lDRjdKWM';

    // Get metadata about spreadsheet
    const metaData = await google.sheets({ version: 'v4', auth: client }).spreadsheets.get({
      auth,
      spreadsheetId,
    });

    // Write row(s) to spreadsheet
    await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values],
      },
    });

    console.log('Data written to Google Sheets successfully');
  } catch (err) {
    console.error('Error writing to Google Sheets:', err);
  }
};

module.exports = googleSheets;
