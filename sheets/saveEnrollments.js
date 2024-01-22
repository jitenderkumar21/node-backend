const { google } = require('googleapis');
const moment = require('moment-timezone');
const teacherInviteInfo = require('../teacherInviteInfo'); // Import the module
const getIpInfo = require('../location/IPInfo'); // Import the module

const saveEnrollments = async (personDetails,ipAddress) => {
  try {
    const invitesInfo =  await teacherInviteInfo();
    const ipInfo = await getIpInfo(ipAddress);

    const date = new Date();
    const formattedTimestamp = moment(date).tz('Asia/Kolkata').format('DD MMM YYYY HH:mm');

    const rows = personDetails.classDetails.map((classDetail) => {
      const timeslot = classDetail.timeslot || '';
      let wantAnotherSlot = timeslot.toLowerCase().startsWith("want another slot") ? timeslot : '';
      // Remove the part before colon (if colon exists)
      const colonIndex = wantAnotherSlot.indexOf(':');
      wantAnotherSlot = colonIndex !== -1 ? wantAnotherSlot.substring(colonIndex + 1).trim() : wantAnotherSlot;
      const { classid } = classDetail;
      const inviteClassInfo = invitesInfo[classid];
      // Initialize variables outside the if block
      let classStartTime, classEndTime;

      if (inviteClassInfo[3] !== undefined && inviteClassInfo[4] !== undefined) {
        // PST timings
        classStartTime = moment(inviteClassInfo[3], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        classEndTime = moment(inviteClassInfo[4], 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
      }

      const values = [
        formattedTimestamp,
        personDetails.parentName,
        personDetails.childName,
        personDetails.email,
        personDetails.childAge,
        personDetails.phoneNumber,
        inviteClassInfo[1],
        personDetails.knowabout,
        personDetails.additionalInfo,
        classDetail.className,
        classStartTime ? classStartTime.format('D MMMM') : '',
        classStartTime ? classStartTime.format('dddd') : '',
        classStartTime ? classStartTime.format('h:mm A') : '',
        classEndTime ? classEndTime.format('h:mm A') : '',
        wantAnotherSlot,
        ipInfo.region,
        ipInfo.country,
        ipInfo.city,
        ipInfo.timezone,
      ];

      return values;
    });

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
