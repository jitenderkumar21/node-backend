// googleSheets.js

const { google } = require('googleapis');

const classesInfo = async () => {
  try {
    

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1i3d_TL431xMTECIVXIATUcsGgcaAc-aSPhogAYwXdek';

    const readResult = await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'Sheet1!A:O', // Specify the range you want to read
      });

      const keys = [
        'id',
        'title',
        'class_details',
        'prerequisite',
        'learning_outcomes',
        'about_teacher',
        'teaching_philosophy',
        'teacher_pic',
        'age_group',
        'duration',
        'link',
        'tutor'
      ];
  
      const rows = readResult.data.values;
      const arrayOfObjects = [];
      const jsonObject = {};

      if (rows.length) {
        rows.slice(1).forEach((row) => {

            const jsonObject = {};

          for (let i = 0; i < keys.length; i++) {
            jsonObject[keys[i]] = row[i];
            }
            // console.log(row);
            jsonObject['expand']=true;
            jsonObject['timeslots']=[row[12],row[13],row[14]];
            arrayOfObjects.push(jsonObject);
        });
      } else {
        console.log('No data found.');
      }
      console.log(arrayOfObjects);
      return arrayOfObjects;


  } catch (err) {
    console.error('Error writing to Google Sheets:', err);
  }
};

module.exports = classesInfo;
