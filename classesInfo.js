// googleSheets.js

const { google } = require('googleapis');
const moment = require('moment-timezone');

const classesInfo = async (userTimeZone) => {
  try {

    let timeZoneAbbreviation = moment.tz([2023, 0], userTimeZone).zoneAbbr();
    let userTimeZoneColumn = 12;
    if(timeZoneAbbreviation=='MST'){
        userTimeZoneColumn=16;
    }else if(timeZoneAbbreviation=='EST'){
        userTimeZoneColumn=17;
    }else if(timeZoneAbbreviation=='CST'){
        userTimeZoneColumn=18;
    }

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
        range: 'Sheet1!A:U', // Specify the range you want to read
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

            let classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
            let classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
            
            
            if(timeZoneAbbreviation=='MST'){
              classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
              classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            }else if(timeZoneAbbreviation=='EST'){
              classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
              classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
            }else if(timeZoneAbbreviation=='CST'){
              classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
              classEndTime = moment(row[20], 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
            }else{
              timeZoneAbbreviation = 'PST';
            }
            let displayClassTime = "";

            if (classStartTime.isValid() && classEndTime.isValid()) {
              const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h A');
              const formattedClassEndTime = classEndTime.format('h A');
              let currentTime = moment(); // current time
              let classStartTimeIST = moment(row[19], 'YYYY-MM-DD HH:mm');
            

              if (classStartTimeIST.isBefore(currentTime)) {
                  displayClassTime = "";
              }else{
                  // Format the final string
                  displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
              }
            }


            jsonObject['timeslots']=[displayClassTime,row[14]];
            jsonObject['isSlotOpen']=[row[13],'yes']
            arrayOfObjects.push(jsonObject);
        });
      } else {
        console.log('No data found.');
      }
    
      return arrayOfObjects;


  } catch (err) {
    console.error('Error reading from to Google Sheets:', err);
  }
};

module.exports = classesInfo;
