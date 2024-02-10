const { google } = require('googleapis');
const teacherInviteInfo = require('./teacherInviteInfo'); // Import the module
const moment = require('moment-timezone');

const migrateData = async () => {
    try {
        const invitesInfo =  await teacherInviteInfo();
        // console.log(invitesInfo);
        const auth = new google.auth.GoogleAuth({
          keyFile: 'credentials.json',
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
        });
    
        // Create client instance for auth
        const client = await auth.getClient();
    
        const spreadsheetId = '1zBKa0aa_P3M-Zq-x3lDh4jI9b7s--L4QYsNYqfVaJ-Y';
    
        const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
          auth,
          spreadsheetId,
          range: 'Format 1!A:CE', // Update the range based on your data structure
        });
    
        const rows = readResult.data.values;
        var googleSheetsData = [];
    
        if (rows.length) {
          rows.slice(1).forEach((row) => {
            // Assuming the data is in the same format as written in googleSheets
            let timezone = row[20];
            // console.log(timezone);
            if(timezone === undefined || timezone === ''){
                googleSheetsData.push(['']);
            }else{
                let timeZoneAbbreviation = moment.tz([2023, 0], timezone).zoneAbbr();
                if(timezone === 'Asia/Ho_Chi_Minh'){
                    console.log(timeZoneAbbreviation);
                }
                googleSheetsData.push([timezone,timeZoneAbbreviation.toString()]);
            }
            

            });

        } else {
          console.log('No data found.');
        }
        // console.log(googleSheetsData);
        // saveEnrollments(googleSheetsData);
        return googleSheetsData;
      } catch (err) {
        console.error('Error reading data from Google Sheets:', err);
      }
  };
  
  (async () => {
    await migrateData();
    console.log('Migration completed successfully.');
  })();



  const saveEnrollments = async (googleSheetsData) => {
    // console.log(googleSheetsData);
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });
  
      // Create client instance for auth
      const client = await auth.getClient();
  
      const spreadsheetId = '1NbmX0dsDYmkavqJas46Oeb2PrJC0W3eVbAG_UJ5NUIQ';
  
      // Write rows to spreadsheet
      await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Sheet6!A:P', // Adjust the range as needed
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: googleSheetsData,
        },
      });
  
      console.log('Enrollments Saved in Migrated successfully');
    } catch (err) {
      console.error('Error writing to Google Sheets:', err);
    }
  };
  module.exports = migrateData;
  