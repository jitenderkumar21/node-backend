const cron = require('node-cron');
const moment = require('moment');
const { Client } = require('pg');
const request = require('request');
const axios = require('axios');
const sendParentReminderEmail = require('../emails/parentEmailReminder');
const classCancelltionInfo = require('../sheets/classCancellationInfo');
const {  insertSystemReport } = require('../dao/systemReportDao')

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';


const sendReminder = async (reminderId,reminder_type, additionalInfo) => {
    // Assume you have a function to send reminders
    // console.log('Sending reminder for ID:', reminderId, 'with additional info:', additionalInfo);
    if(reminder_type==='BEFORE_CLASS_15_EMAIL' || reminder_type==='MORNING_8_EMAIL'){
        sendParentReminderEmail(reminderId,reminder_type, additionalInfo)
    }
    else{
        console.log('Sending whatsapp reminder');
    // Send WhatsApp reminder with callback to handle success and response body
        await sendWhatsappReminder(reminderId,reminder_type, additionalInfo, (success, responseBody) => {
            // After sending the reminder, update the reminder_status and save response body
            const updateClient = new Client({
                connectionString: connectionString,
            });
            updateClient.connect();
            const statusToUpdate = success ? 'SUCCESS' : 'FAILURE';
            updateClient.query('UPDATE reminders SET reminder_status = $1, response_body = $2 WHERE id = $3', [statusToUpdate, responseBody, reminderId], (err, result) => {
                updateClient.end();
                if (err) {
                    console.error('Error updating reminder status:', err);
                } else {
                    console.log('Reminder status updated successfully for ID:', reminderId);
                }
            });
            if(statusToUpdate==='FAILURE'){
                console.log('WA reminder failed, sending email reminder for ID:', reminderId);
                const reportData = { channel: 'WHATSAPP', type: 'Parent Reminder', status: 'FAILURE', reason: error.message, parentEmail: additionalInfo.email, classId:additionalInfo.classId, reminderId:reminderId};
                insertSystemReport(reportData);
            }else{
                const reportData = { channel: 'WHATSAPP', type: 'Parent Reminder', status: 'SUCCESS', parentEmail: additionalInfo.email, classId:additionalInfo.classId, reminderId:reminderId};
                insertSystemReport(reportData);
            }
        });
    }
};

const sendWhatsappReminder = async (reminderId,reminder_type, additionalInfo, callback) => {
    try {
        const classStartTimesMap = await classCancelltionInfo();
        const parentName = additionalInfo.parentName;
        const kidName = additionalInfo.kidName;
        const namesArray = kidName.split(',').map(name => name.trim());
        let formattedNames;
        let isMultipleKids = false;
        if (namesArray.length >= 2) {
            formattedNames = namesArray.slice(0, -1).join(', ') + ` and ${namesArray[namesArray.length - 1]}`;
            isMultipleKids = true;
        } else {
            formattedNames = kidName;
        }
        const className = additionalInfo.className;
        const classTiming = additionalInfo.classTiming;
        const prerequisite = additionalInfo.prerequisites;
        const classid = additionalInfo.classId;

        // Hardcoded Zoom meeting details
        const zoomMeetingLink = additionalInfo.zoomMeetingLink;
        const meetingId = additionalInfo.meetingId;
        const passcode = additionalInfo.passcode;
        let message;

        if (reminder_type === 'MORNING_8') {
            // Morning reminder message
            message = `
Hello ${parentName},

Just a friendly reminder that ${formattedNames}'s class is scheduled for today.

Class Details
- Class Name: ${className}
- Class Timing: ${classTiming}
- Zoom Details:
    - ${zoomMeetingLink}
    - ${meetingId}
    - ${passcode}

If you have any questions or if ${formattedNames} cannot join today, feel free to text us back!

Happy Learning!
`;
      
    }else if (reminder_type === 'BEFORE_CLASS_15') {
            // Night reminder message
            message = `
Hello ${parentName},

Just a friendly reminder that ${formattedNames}'s class is in 15 Minutes. Please make sure ${formattedNames} ${isMultipleKids ? 'are' : 'is'} prepared for class.

Class Details
- Class Name: ${className}
- Class Timing: ${classTiming}
- Zoom Details:
    - ${zoomMeetingLink}
    - ${meetingId}
    - ${passcode}

We would request you to join class with your video on, so that our team can verify the learner's identity.

If you have any questions or if ${formattedNames} cannot join today, feel free to text us back!

Happy Learning!
`;
    }else {
        message = '';
        if (classStartTimesMap[classid] && classStartTimesMap[classid][1] !== undefined && classStartTimesMap[classid][1] !== '' && classStartTimesMap[classid][1].toLowerCase() !== 'there are no prerequisites needed for the class.') {
            message+= `Prerequisites: ${classStartTimesMap[classid][1]}`
        }
        if (classStartTimesMap[classid][7] !== undefined && classStartTimesMap[classid][7] !== '') {
            message += `Class Material : ${classStartTimesMap[classid][7]}`;
        }
          
        if(message==undefined || message=='') {
            callback(false, 'Skipping reminder due to No prerequisite or Class Materials');
            return; 
        }
}




        const options = {
            method: 'POST',
            url: 'https://whats-api.rcsoft.in/api/create-message',
            headers: {},
            data: {
                'appkey': '0927e369-9303-4b4a-954c-3f19996c8d68',
                'authkey': 'SN9DGOWza87LIgdUGwWVjzF2Oq6tAEtYAcKqDXWcaVvvY46RRY',
                'to': additionalInfo.receiverNumber,
                'message': message
            }
        };

        const response = await axios(options);

        console.log('Reminder sent successfully for ID:', reminderId);
        console.log('Response:', response.data);

        // Check if the statusCode is 200 for success
        const success = response && response.status === 200 && response.data && response.data.message_status === "Success";
        callback(success, response ? response.data : null);
    } catch (error) {
        console.error('Error in sendWhatsappReminder:', error);
        callback(false, null);
    }
};

const whatsappReminderCron = cron.schedule('*/15 * * * *', async () => {
    const currentClient = new Client({
        connectionString: connectionString,
    });
    try {
        const currentTimeUTC = new Date().toUTCString();
        console.log(`Cron job is running every 15 minute at ${currentTimeUTC}`);

        // // Connect to the PostgreSQL database
        await currentClient.connect();

        // Fetch entries where reminder_time is less than or equal to the current time and reminder_status is 'NOT_SENT'
        const result = await currentClient.query('SELECT * FROM REMINDERS WHERE reminder_time <= $1 AND reminder_status = $2 and reminder_type!=$3 ORDER BY created_on', [currentTimeUTC, 'NOT_SENT','TEACHER_REMINDER']);

        // // Process each entry, send reminders, and update reminder status
        for (const row of result.rows) {
            const reminderId = row.id;
            const additionalInfo = row.additional_info;
            console.log(reminderId, additionalInfo)
            if(reminderId===2919 || reminderId===2917 || reminderId===2918 || reminderId===2916){
                console.log('yes');
                await sendReminder(reminderId,row.reminder_type, additionalInfo);
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    } finally {
        // Close the database connection
        await currentClient.end();
    }
});

module.exports = whatsappReminderCron;
