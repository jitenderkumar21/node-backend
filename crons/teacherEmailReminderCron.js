const { Client } = require('pg');
const cron = require('node-cron');
const sendTeacherReminderEmail = require('../emails/teacherEmailReminder');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';


const teacherEmailReminderCron = cron.schedule('*/5 * * * *', async () => {
    const currentClient = new Client({
        connectionString: connectionString,
    });
    try {
        const currentTimeUTC = new Date().toUTCString();
        console.log(`teacherEmailReminderCron is running every 15 minute at ${currentTimeUTC}`);

        // Connect to the PostgreSQL database
        await currentClient.connect();

        // Fetch entries where reminder_time is less than or equal to the current time and reminder_status is 'NOT_SENT'
        const result = await currentClient.query('SELECT * FROM REMINDERS WHERE reminder_time <= $1 AND reminder_status = $2 and reminder_type=$3 ORDER BY created_on', [currentTimeUTC, 'NOT_SENT','TEACHER_REMINDER']);

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