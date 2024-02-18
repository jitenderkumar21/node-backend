// googleSheets.js

const { google } = require('googleapis');

const teacherInviteInfo = async () => {
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
        range: 'Sheet1!A:Y', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var teacherInviteInfo = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            var value = [row[1],row[11],row[12],row[19],row[20],row[22],row[23],row[24],row[14]];
            teacherInviteInfo[classId] = value;
        });
      } else {
        console.log('No data found.');
      }

      return teacherInviteInfo;


  } catch (err) {
    console.error('Error reading teacherInviteInfo from sheet', err);
  }
};

module.exports = teacherInviteInfo;
