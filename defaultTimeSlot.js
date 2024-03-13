// googleSheets.js

const { google } = require('googleapis');
const moment = require('moment-timezone');
const ClassUtility = require('./utils/subClassUtility');

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
        range: 'Sheet1!A:V', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var defaultTimeZone = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            let classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            let classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            let displayClassTime = "";
            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');
              // Format the final string
              let timeZoneAbbreviation = 'PST';
              const modifiedTimeZone = ClassUtility.getModifiedTimeZone(timeZoneAbbreviation);
              displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${modifiedTimeZone})`;
            }
            defaultTimeZone[classId] = displayClassTime;
        });
      } else {
        console.log('No data found.');
      }
      return defaultTimeZone;


  } catch (err) {
    console.error('Error reading defaultTimeSlots from sheet', err);
  }
};

module.exports = defaultTimeZone;
