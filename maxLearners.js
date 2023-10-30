// googleSheets.js

const { google } = require('googleapis');

const maxLearners = async () => {
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
        range: 'Sheet1!A:S', // Specify the range you want to read
      });

      
      const rows = readResult.data.values;
      var overAllMap = {};
      var classIdToValue = {};
      var classIdToSlots = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {
            var classId = row[0];
            var value = row[15];
            classIdToValue[classId] = value;
            classIdToSlots[classId] = [row[12],row[16],row[17],row[18]];
        });
      } else {
        console.log('No data found.');
      }
      console.log(classIdToValue);
      overAllMap['classIdToValue']=classIdToValue;
      overAllMap['classIdToSlots']=classIdToSlots;
      console.log('overAllMap',overAllMap);
      return overAllMap;


  } catch (err) {
    console.error('Error reading maxLearners from sheet', err);
  }
};

module.exports = maxLearners;
