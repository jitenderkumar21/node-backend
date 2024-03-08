// googleSheets.js

const { google } = require('googleapis');
require('dotenv').config();
const SubClassDTO = require('../dto/SubClassDTO'); // Import the SubClassDTO

/**
 * Fetches sub-classes information from a Google Sheets document.
 * @returns {Object} An object containing sub-classes information.
 */
const getSubClassesInfo = async () => {
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
      range: 'sub-classes!A:Y', // Specify the range you want to read
    });

    const rows = readResult.data.values;
    const subClassesInfo = {};

    if (rows.length) {
      rows.slice(1).forEach((row) => {
        const subClassId = `${row[0]}_${row[1]}`;

        const subClassInfo = new SubClassDTO(
          row[0], // classId
          row[1], // subClassId
          row[2], // teacherName
          row[3], // teacherEmail
          row[4], // teacherTimezone
          row[5], // classMaterial
          row[6], // prerequisite
          row[7], // zoomMeetingLink
          row[8], // meetingId
          row[9]  // passcode
        );

        subClassesInfo[subClassId] = subClassInfo;
      });
    } else {
      console.log('No data found.');
    }

    return subClassesInfo;

  } catch (err) {
    console.error('Error reading sub-classes information from the sheet', err);
  }
};

module.exports = getSubClassesInfo;
