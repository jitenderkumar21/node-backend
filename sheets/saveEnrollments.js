const { google } = require('googleapis');
const moment = require('moment-timezone');
const teacherInviteInfo = require('../teacherInviteInfo'); // Import the module
const getIpInfo = require('../location/IPInfo'); // Import the module
const ClassUtility = require('../utils/subClassUtility');

const saveEnrollments = async (personDetails,ipAddress) => {
  try {
    const invitesInfo =  await teacherInviteInfo();
    const ipInfo = await getIpInfo(ipAddress);

    const date = new Date();
    const formattedTimestamp = moment(date).tz('Asia/Kolkata').format('DD MMM YYYY HH:mm');

    const rows = personDetails.classDetails.flatMap((classDetail) => {
      const timeslots = classDetail.timeslots || [];
      const { classid } = classDetail;
      const inviteClassInfo = invitesInfo[classid];
      let classStartTime, classEndTime;

      if (inviteClassInfo[3] !== undefined && inviteClassInfo[4] !== undefined) {
        // PST timings
        classStartTime = moment(inviteClassInfo[3], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        classEndTime = moment(inviteClassInfo[4], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
      }
      const dateDayTimeColumns = [
        classStartTime ? classStartTime.format('dddd') : '',
        classStartTime ? classStartTime.format('h:mm A') : '',
        classEndTime ? classEndTime.format('h:mm A') : '',
      ];

      return timeslots
      .filter((timeslot) => !timeslot.isPast)  // Filter out timeslots where isPast is true
      .map((timeslot) => {
        const { subClassId, timing, isPast } = timeslot;
        const classIdFomatted = ClassUtility.getClassId(subClassId, classDetail.classTag);
        const values = [
          formattedTimestamp,
          personDetails.parentName,
          personDetails.childName,
          personDetails.email,
          personDetails.childAge,
          personDetails.commPref,
          personDetails.phoneNumber,
          inviteClassInfo[1],
          personDetails.knowabout,
          personDetails.additionalInfo,
          classIdFomatted,
          classDetail.classTag,
          classDetail.className,
          timing.split(':')[1].trim(),
          ...dateDayTimeColumns,
          '',
          ipInfo.country,
          ipInfo.region,
          ipInfo.city,
          moment.tz([2023, 0], ipInfo.timezone).zoneAbbr(),
        ];
    
        return values;
      });
    });

    if(personDetails.want_another_slot !== undefined && personDetails.want_another_slot!== ''){
      const additionalRow = [
        formattedTimestamp,
        personDetails.parentName,
        personDetails.childName,
        personDetails.email,
        personDetails.childAge,
        personDetails.commPref,
        personDetails.phoneNumber,
        '', 
        personDetails.knowabout,
        personDetails.additionalInfo,
        '', 
        '',
        '',
        '',
        '',
        '',
        '',
        personDetails.want_another_slot,
        '',
        '',
        '',
        '',
      ];
      rows.push(additionalRow);
    }
    
    // Log the result for testing
    // console.log(rows);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1zBKa0aa_P3M-Zq-x3lDh4jI9b7s--L4QYsNYqfVaJ-Y';

    // Write rows to spreadsheet
    await google.sheets({ version: 'v4', auth: client }).spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Format 1!A:P', // Adjust the range as needed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    console.log('Enrollments Saved in Format 1 successfully');
  } catch (err) {
    console.error('Error writing to Google Sheets:', err);
  }
};

module.exports = saveEnrollments;
