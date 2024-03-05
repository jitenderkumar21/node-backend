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
          range: 'Sheet1!A:CE', // Update the range based on your data structure
        });
    
        const rows = readResult.data.values;
        var googleSheetsData = [];
    
        if (rows.length) {
          rows.slice(1).forEach((row) => {
            // Assuming the data is in the same format as written in googleSheets
            var basicDetails = [
              row[0], // timestamp
              row[1], // parentName
              row[2], // childName
              row[3], // email
              row[4], // childAge
              row[5], // phoneNumber
              row[6], // knowabout
              row[7], // additionalInfo
            ];
    
            // Find indices of non-empty columns for timeslot
            const timeslotIndices = row.slice(8).map((value, index) => value !== '' ? index + 8 : -1).filter(index => index !== -1);
            
            
            timeslotIndices.forEach(timeslotIndex => {
            let inviteClassInfo = invitesInfo[timeslotIndex - 4];
            let timeslot = row[timeslotIndex - 4];
            const prefix = "want another slot";
            let values = [];
            if(timeslot!=undefined && timeslot.toLowerCase().startsWith(prefix)){
                // console.log(timeslot);
                values = [
                    row[0], // formattedTimestamp
                    row[1], // personDetails.parentName
                    row[2], // personDetails.childName
                    row[3], // personDetails.email
                    row[4], // personDetails.childAge
                    row[5], // personDetails.phoneNumber
                    '',
                    row[6], // personDetails.knowabout
                    row[7], // personDetails.additionalInfo
                    timeslotIndex-4, // classIdFormatted
                    'Onetime', // classDetail.classTag
                    '',
                    '',
                    '',
                    '',
                    '',
                    timeslot, // (empty column)
                    '',
                    '',
                    '',
                    '',
                  ];
            }else{
            // console.log('inviteClassInfo',timeslotIndex - 4,inviteClassInfo)
            if(inviteClassInfo == undefined){
                console.log(timeslotIndex-4);
                inviteClassInfo =  [
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND',
                    'NOT FOUND'
                  ]
            }
            if (inviteClassInfo[3] !== undefined && inviteClassInfo[4] !== undefined && inviteClassInfo[3] !== 'NOT FOUND') {
                // PST timings
                classStartTime = moment(inviteClassInfo[3], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
                classEndTime = moment(inviteClassInfo[4], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
              }
              const dateDayTimeColumns = [
                classStartTime ? classStartTime.format('DD MMMM') : '',
                classStartTime ? classStartTime.format('dddd') : '',
                classStartTime ? classStartTime.format('h:mm A') : '',
                classEndTime ? classEndTime.format('h:mm A') : '',
              ];
            values = [
                row[0], // formattedTimestamp
                row[1], // personDetails.parentName
                row[2], // personDetails.childName
                row[3], // personDetails.email
                row[4], // personDetails.childAge
                row[5], // personDetails.phoneNumber
                inviteClassInfo[1], // inviteClassInfo[1]
                row[6], // personDetails.knowabout
                row[7], // personDetails.additionalInfo
                timeslotIndex-4, // classIdFormatted
                'Onetime', // classDetail.classTag
                inviteClassInfo[0], // classDetail.className
                ...dateDayTimeColumns, // dateDayTimeColumns
                '', // (empty column)
                '',
                '',
                '',
                '',
              ];
            }
              googleSheetsData.push(values);
            });
          });
        } else {
          console.log('No data found.');
        }
        // console.log(googleSheetsData);
        saveEnrollments(googleSheetsData);
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
        range: 'Sheet8!A:P', // Adjust the range as needed
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
  