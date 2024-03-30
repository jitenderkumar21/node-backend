// googleSheets.js

const { google } = require('googleapis');
const moment = require('moment-timezone');

const NodeCache = require('node-cache');
const myCache = new NodeCache();

const cachedClassesInfo = async (userTimeZone) => {
  // Check if the result is already in the cache
  const cachedResult = myCache.get(userTimeZone);
  if (cachedResult) {
    console.log('Cache hit! Returning cached result.');
    return cachedResult;
  }

  // If not in cache, perform the actual operation
  const result = await classesInfo(userTimeZone);

  // Store the result in the cache for future use with a time-to-live (TTL) of, for example, 10 minutes
  myCache.set(userTimeZone, result, 600); // in seconds

  return result;
};


const classesInfo = async (userTimeZone) => {
  try {

    let timeZoneAbbreviation = moment.tz([2023, 0], userTimeZone).zoneAbbr();
    let offset = 8;
    if(timeZoneAbbreviation=='MST'){
      offset=7;
    }else if(timeZoneAbbreviation=='EST'){
      offset=5;
    }else if(timeZoneAbbreviation=='CST'){
      offset=6;
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
        range: 'Sheet1!A:AE', // Specify the range you want to read
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
              const day = classStartTime.format('dddd');
              const startTime = classStartTime.format('h:mm A');
              const formattedClassEndTime = classEndTime.format('h:mm A');
              let currentTime = moment(); // current time
              let classStartTimeIST = moment(row[19], 'YYYY-MM-DD HH:mm');
            
              const isOneTime = row[17]?.toLowerCase() === 'onetime';
              // console.log(isOneTime);
              
              displayClassTime = isOneTime
                  ? `${day}, ${startTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`
                  : `${day}s, ${startTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
                    
            }
            jsonObject['display_timing']=displayClassTime;
            let timeslots = [];
            const MAX_SLOTS = parseInt(row[25]) || 1;
            // console.log('Max slots',MAX_SLOTS);
            for (let counter = 0; counter < MAX_SLOTS; counter++) {
      
                const subClassId = `${row[0]}_${counter + 1}`; // Assuming 'id' is the first column
                const classStartTime = moment(row[19], 'YYYY-MM-DD HH:mm').format('HH:mm');

                const classStartDate = counter === 0
                        ? moment.utc(row[19], 'YYYY-MM-DD HH:mm').subtract(offset,'hours')
                        : moment.utc(row[25 + counter] + ' ' + classStartTime, 'YYYY-MM-DD HH:mm').subtract(offset,'hours');
                const classStartDateUTC = counter === 0
                        ? moment.utc(row[19], 'YYYY-MM-DD HH:mm')
                        : moment.utc(row[25 + counter] + ' ' + classStartTime, 'YYYY-MM-DD HH:mm');
                const isPast = classStartDateUTC.isBefore(moment.utc());
                const teacherPreference = parseInt(row[18]) || 1;
                if(row[17].toLowerCase()==='course' && counter+1===teacherPreference){
                  jsonObject['isMoveToPast']=isPast;
                }else if(row[17].toLowerCase()==='ongoing' && counter+1==MAX_SLOTS){
                  jsonObject['isMoveToPast']=isPast;
                }else if(row[17].toLowerCase()==='onetime'){
                  jsonObject['isMoveToPast']=isPast;
                }
                // console.log(moment.utc());
                // console.log(isPast,subClassId,classStartDate,classStartDate.isValid());
                if (classStartDate.isValid()) {
                  const formattedClassStartDate = `Class ${counter + 1}: ${classStartDate.format('D MMMM')}`;
                  const timeslot = { subClassId, timing: formattedClassStartDate, isPast };
                  timeslots.push(timeslot);
                }
                
            }
            jsonObject['timeslots']=timeslots;

            jsonObject['isSlotOpen']=['yes','yes']
            jsonObject['class_tag']=row[17];
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

module.exports = {
  classesInfo,
  cachedClassesInfo,
}
  ;
