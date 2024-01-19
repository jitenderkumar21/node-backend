const cron = require('node-cron');
const moment = require('moment');
const { Client } = require('pg');
const request = require('request');
const axios = require('axios');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';


const sendReminder = async (reminderId,reminder_type, additionalInfo) => {
    // Assume you have a function to send reminders
    console.log('Sending reminder for ID:', reminderId, 'with additional info:', additionalInfo);

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
    });
};

const sendWhatsappReminder = async (reminderId,reminder_type, additionalInfo, callback) => {
    try {
        const parentName = additionalInfo.parentName;
        const kidName = additionalInfo.kidName;
        const className = additionalInfo.className;
        const classTiming = additionalInfo.classTiming;
        const prerequisite = additionalInfo.prerequisites;

        // Hardcoded Zoom meeting details
        const zoomMeetingLink = additionalInfo.zoomMeetingLink;
        const meetingId = additionalInfo.meetingId;
        const passcode = additionalInfo.passcode;
        let message;

        if (reminder_type === 'MORNING_8') {
            // Morning reminder message
            message = `
Hello ${parentName},

Just a quick reminder that ${kidName}'s class is scheduled for today. Please make sure ${kidName} is in a quiet space for learning! 

Here are more details about the class:

- Class Name: ${className}
- Class Timing: ${classTiming}
Zoom Meeting Link: ${zoomMeetingLink}
Meeting ID: ${meetingId}
Passcode: ${passcode}

We would request you to join class with your video on, so that our team can verify the learner’s identity.

If you have any questions or if your kid cannot join today, feel free to text us back!

Excited to see your kid in the class!

Best Regards,
Coral Academy
`;
      
    }else if (reminder_type === 'BEFORE_CLASS_15') {
            // Night reminder message
            message = `
Hello ${parentName},

Just a friendly reminder that ${kidName}'s class is in 15 Minutes. Please make sure ${kidName} is prepared for class.

Class Details
- Class Name: ${className}
- Class Timing: ${classTiming}

Zoom Meeting Link: ${zoomMeetingLink}
Meeting ID: ${meetingId}
Passcode: ${passcode}

We would request you to join class with your video on, so that our team can verify the learner's identity.

If you have any questions or if ${kidName} cannot join today, feel free to text us back!
We hope to see ${kidName} in class!

Best Regards,
Coral Academy
`;
        }else {
            message = `
Here are the prerequisites for the class:

- ${prerequisite}

Best Regards,
Coral Academy
`
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
        const success = response.status === 200;
        callback(success, response.data);
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
        console.log(`Cron job is running every minute at ${currentTimeUTC}`);


        // Connect to the PostgreSQL database
        await currentClient.connect();

        // Fetch entries where reminder_time is less than or equal to the current time and reminder_status is 'NOT_SENT'
        const result = await currentClient.query('SELECT * FROM REMINDERS WHERE reminder_time <= $1 AND reminder_status = $2', [currentTimeUTC, 'NOT_SENT']);

        // Process each entry, send reminders, and update reminder status
        for (const row of result.rows) {
            const reminderId = row.id;
            const additionalInfo = row.additional_info;
            // console.log(reminderId, additionalInfo)
            await sendReminder(reminderId,row.reminder_type, additionalInfo);
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    } finally {
        // Close the database connection
        await currentClient.end();
    }
});

module.exports = whatsappReminderCron;
