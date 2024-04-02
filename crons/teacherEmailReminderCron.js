const { Client } = require('pg');
const cron = require('node-cron');
const sendTeacherReminderEmail = require('../emails/teacherEmailReminder');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;


const teacherEmailReminderCron = cron.schedule('*/60 * * * *', async () => {
    const currentClient = new Client({
        connectionString: connectionString,
    });
    try {
        const currentTimeUTC = new Date().toUTCString();
        console.log(`teacherEmailReminderCron is running every 15 minute at ${currentTimeUTC}`);

        // Connect to the PostgreSQL database
        await currentClient.connect();

        const currentTimePlus20Minutes = new Date(new Date().getTime() - 20 * 60 * 1000).toUTCString();
        console.log('currentTimePlus20Minutes',currentTimePlus20Minutes);

        // Fetch entries where reminder_time is less than or equal to the current time and reminder_status is 'NOT_SENT'
        const result = await currentClient.query(
            'SELECT * FROM REMINDERS WHERE reminder_time <= $1 AND reminder_time > $2 AND reminder_status = $3 AND reminder_type = $4 ORDER BY created_on',
            [currentTimeUTC, currentTimePlus20Minutes, 'NOT_SENT', 'TEACHER_REMINDER']
          );

        // Process each entry, send reminders, and update reminder status
        for (const row of result.rows) {
            const reminderId = row.id;
            const additionalInfo = row.additional_info;
            // console.log(reminderId, additionalInfo)
            await sendTeacherReminderEmail(reminderId, additionalInfo);
            
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    } finally {
        // Close the database connection
        await currentClient.end();
    }
});

module.exports = teacherEmailReminderCron;