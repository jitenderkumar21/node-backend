const { google } = require('googleapis');
const moment = require('moment-timezone');
const teacherInviteInfo = require('../teacherInviteInfo'); // Import the module
const getSubClassesInfo = require('../sheets/getSubClassesInfo');
const getIpInfo = require('../location/IPInfo'); // Import the module
const ClassUtility = require('../utils/subClassUtility');
require('dotenv').config();
const {  insertSystemReport } = require('../dao/systemReportDao')
const { bulkInsertEnrollments } = require('../dao/enrollmentsDao');

const saveEnrollments = async (personDetails,ipAddress) => {
  try {
    const invitesInfo =  await teacherInviteInfo();
    const subClassesInfo = await getSubClassesInfo();
    const ipInfo = await getIpInfo(ipAddress);

    const date = new Date();
    const formattedTimestamp = moment(date).tz('Asia/Kolkata').format('DD MMM YYYY HH:mm');

    let classIdArray = [];

    const rows = personDetails.classDetails.flatMap((classDetail) => {
      const timeslots = classDetail.timeslots || [];
      const { classid } = classDetail;
      const inviteClassInfo = invitesInfo[classid];
      let classStartTime, classEndTime;

      if (inviteClassInfo[3] !== undefined && inviteClassInfo[4] !== undefined) {
        // PST timings
        classStartTime = moment(inviteClassInfo[3], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
        classEndTime = moment(inviteClassInfo[4], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
      }
      const dateDayTimeColumns = [
        classStartTime ? classStartTime.format('dddd') : '',
        classStartTime ? classStartTime.format('h:mm A') : '',
        classEndTime ? classEndTime.format('h:mm A') : '',
      ];

      return timeslots
      .filter((timeslot) => !timeslot.isPast && !timeslot.isWaitlist)  // Filter out timeslots where isPast is true
      .map((timeslot) => {
        const { subClassId, timing, isPast, isWaitlist } = timeslot;
        let isTimeSlotWaitlist = '';
        if(isWaitlist){
          isTimeSlotWaitlist = 'WAITLIST';
        }
        classIdArray.push(subClassId);
        let subClassInfo = subClassesInfo[subClassId];
        const classIdFomatted = ClassUtility.getClassId(subClassId, classDetail.classTag);
        const values = [
          formattedTimestamp,
          personDetails.parentName,
          personDetails.childName,
          personDetails.email,
          personDetails.childAge,
          personDetails.commPref.join(','),
          personDetails.phoneNumber,
          subClassInfo.teacherName,
          personDetails.knowabout,
          personDetails.additionalInfo,
          personDetails.comments,
          subClassId,
          classDetail.classTag,
          classDetail.className,
          timing.split(':')[1].trim(),
          ...dateDayTimeColumns,
          '',
          ipInfo.country,
          ipInfo.region,
          ipInfo.city,
          moment.tz([2023, 0], ipInfo.timezone).zoneAbbr(),
          subClassInfo.subClassName,
          ipInfo.postal,
          personDetails.enrichment,
          personDetails.knowabout
        ];
    
        return values;
      });
    });

    const walitlistRows = personDetails.classDetails.flatMap((classDetail) => {
      const timeslots = classDetail.timeslots || [];
      const { classid } = classDetail;
      const inviteClassInfo = invitesInfo[classid];
      let classStartTime, classEndTime;

      if (inviteClassInfo[3] !== undefined && inviteClassInfo[4] !== undefined) {
        // PST timings
        classStartTime = moment(inviteClassInfo[3], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
        classEndTime = moment(inviteClassInfo[4], 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
      }
      const dateDayTimeColumns = [
        classStartTime ? classStartTime.format('dddd') : '',
        classStartTime ? classStartTime.format('h:mm A') : '',
        classEndTime ? classEndTime.format('h:mm A') : '',
      ];

      return timeslots
      .filter((timeslot) => !timeslot.isPast && timeslot.isWaitlist)  // Filter out timeslots where isPast is true
      .map((timeslot) => {
        const { subClassId, timing, isPast, isWaitlist } = timeslot;
        let isTimeSlotWaitlist = '';
        if(isWaitlist){
          isTimeSlotWaitlist = 'WAITLIST';
        }
        classIdArray.push(subClassId);
        let subClassInfo = subClassesInfo[subClassId];
        const classIdFomatted = ClassUtility.getClassId(subClassId, classDetail.classTag);
        const values = [
          formattedTimestamp,
          personDetails.parentName,
          personDetails.childName,
          personDetails.email,
          personDetails.childAge,
          personDetails.commPref.join(','),
          personDetails.phoneNumber,
          subClassInfo.teacherName,
          personDetails.knowabout,
          personDetails.additionalInfo,
          personDetails.comments,
          subClassId,
          classDetail.classTag,
          classDetail.className,
          timing.split(':')[1].trim(),
          ...dateDayTimeColumns,
          '',
          ipInfo.country,
          ipInfo.region,
          ipInfo.city,
          moment.tz([2023, 0], ipInfo.timezone).zoneAbbr(),
          subClassInfo.subClassName,
          ipInfo.postal,
          personDetails.enrichment,
          personDetails.knowabout
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
        personDetails.commPref.join(','),
        personDetails.phoneNumber,
        '', 
        personDetails.knowabout,
        personDetails.additionalInfo,
        personDetails.comments,
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
        '',
        '',
        personDetails.enrichment,
        personDetails.knowabout
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

    const spreadsheetId = process.env.RESPONSE_SHEET_ID;

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

    google.sheets({ version: 'v4', auth: client }).spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Waitlist!A:P', // Adjust the range as needed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: walitlistRows,
      },
    });

    console.log('Enrollments Saved in Format 1 successfully');
    bulkInsertEnrollments(rows);
    const reportData = { channel: 'SHEETS', type: 'Save Enrollments', status: 'SUCCESS', parentEmail: personDetails.email, childName: personDetails.childName, classId:classIdArray};
    insertSystemReport(reportData);
  } catch (err) {
    console.error('Error writing to Format 1 Sheets:', err);
    const reportData = { channel: 'SHEETS', type: 'Save Enrollments', status: 'FAILURE', reason: err.message, parentEmail: personDetails.email, childName: personDetails.childName};
    insertSystemReport(reportData);
  }
};

module.exports = saveEnrollments;
