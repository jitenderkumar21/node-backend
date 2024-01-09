const cron = require('node-cron');
const moment = require('moment');
const { Client } = require('pg');
const request = require('request');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';


const sendReminder = async (reminderId, additionalInfo) => {
    // Assume you have a function to send reminders
    console.log('Sending reminder for ID:', reminderId, 'with additional info:', additionalInfo);

    // Send WhatsApp reminder with callback to handle success and response body
    sendWhatsappReminder(reminderId, additionalInfo, (success, responseBody) => {
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

const sendWhatsappReminder = (reminderId, additionalInfo, callback) => {
    try {
        const parentName = additionalInfo.parentName;
        const kidName = additionalInfo.kidName;
        const className = additionalInfo.className;
        const classTiming = additionalInfo.classTiming;

        // Hardcoded Zoom meeting details
        const zoomMeetingLink = 'https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09';
        const meetingId = '329 424 0234';
        const passcode = '123456';

        const message = `
Hello ${parentName},

Just a quick reminder that ${kidName}'s class is scheduled for today. Please make sure he/she is in a quiet space for learning (If any prerequisites/class material is required) and make sure he/she has:

Class Details
- Class Name: ${className}
- Class Timing: ${classTiming}

Zoom Meeting Link: ${zoomMeetingLink}
Meeting ID: ${meetingId}
Passcode: ${passcode}

If you have any questions or if ${kidName} cannot join today, feel free to text us back!

Excited to see him/her in the class!

Best Regards,
Coral Academy
`;

        const options = {
            method: 'POST',
            url: 'https://whats-api.rcsoft.in/api/create-message',
            headers: {},
            formData: {
                'appkey': '560d0f0d-72ce-4b15-aaa0-1bfd345483b8',
                'authkey': 'r5bVbZiQHmlx75Vb0ACRguB7sGSZimJu03NfErRhfETR3JNSKp',
                'to': additionalInfo.receiverNumber,
                'message': message
            }
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error sending reminder for ID:', reminderId, error);
                callback(false, null);
            } else {
                console.log('Reminder sent successfully for ID:', reminderId);
                // Assuming the response.body contains information about the sent message
                console.log('Response:', response.body);

                // Check if the statusCode is 200 for success
                const success = response.statusCode === 200;
                callback(success, response.body);
            }
        });
    } catch (error) {
        console.error('Error in sendWhatsappReminder:', error);
        callback(false, null);
    }
};

const whatsappReminderCron = cron.schedule('* * * * *', async () => {
    const currentClient = new Client({
        connectionString: connectionString,
    });
    try {
        const currentTime = new Date();
        console.log(`Cron job is running every minute at ${currentTime}`);

        // Connect to the PostgreSQL database
        await currentClient.connect();

        // Fetch entries where reminder_time is less than or equal to the current time and reminder_status is 'NOT_SENT'
        const result = await currentClient.query('SELECT * FROM REMINDERS WHERE reminder_time <= $1 AND reminder_status = $2', [currentTime, 'NOT_SENT']);

        // Process each entry, send reminders, and update reminder status
        for (const row of result.rows) {
            const reminderId = row.id;
            const additionalInfo = row.additional_info;
            await sendReminder(reminderId, additionalInfo);
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    } finally {
        // Close the database connection
        await currentClient.end();
    }
});

module.exports = whatsappReminderCron;
