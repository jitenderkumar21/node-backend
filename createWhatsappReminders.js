const { Client } = require('pg');
const classCancelltionInfo = require('./sheets/classCancellationInfo'); // Import the module

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

function createAdditionalInfo(data, classStartTimesMap) {
    return data.classDetails.map(detail => {
        const classTiming = detail.timeslot;
        const classStartTime = classStartTimesMap[detail.classid][1] || null; // Fetch classStartTime from the map

        return {
            parentName: data.parentName,
            kidName: data.childName,
            className: detail.className,
            classTiming: classTiming,
            classStartTime: classStartTime,
            class_id: detail.classid, // Add class_id to the object
            receiverNumber: data.phoneNumber,
        };
    });
}

async function createReminder(info) {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();

        // Drop class_id from additionalInfo before the insert query
        const infoWithoutClassId = { ...info };
        delete infoWithoutClassId.class_id;
        delete infoWithoutClassId.classStartTime;

        // Calculate reminder_time
        const reminderTime = calculateReminderTime(info.classStartTime);

        const query = {
            text: `
                INSERT INTO reminders (additional_info, reminder_time, class_id, phone_number)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (class_id, phone_number)
                DO UPDATE SET
                    additional_info = jsonb_set(
                        COALESCE(reminders.additional_info, '{}'::jsonb),
                        '{kidName}',
                        to_jsonb(COALESCE(reminders.additional_info->>'kidName', '') || ', ' || $5),
                        true
                    ),
                    reminder_time = $2
            `,
            values: [infoWithoutClassId, reminderTime, info.class_id, info.receiverNumber, info.kidName],
        };

        await client.query(query);

        console.log(`Reminder for ${info.kidName}'s class (${info.className}) created successfully.`);
    } catch (error) {
        console.error(`Error creating/updating reminder for ${info.kidName}'s class (${info.className}):`, error.message);
    } finally {
        await client.end();
    }
}

function calculateReminderTime(classStartTime) {
    // Assuming classStartTime is a string in "YYYY-MM-DD HH:mm" format
    const classStartTimeUTC = new Date(`${classStartTime} UTC`);
    const reminderTime = new Date(classStartTimeUTC);
    reminderTime.setHours(reminderTime.getHours() - 2);
    return reminderTime.toISOString(); // Converts to PostgreSQL timestamp format
}

async function createWhatsappReminders(jsonData) {
    const classStartTimesMap = await classCancelltionInfo();
    console.log('classStartTimesMap', classStartTimesMap);
    const additionalInfoArray = createAdditionalInfo(jsonData, classStartTimesMap);
    console.log('additionalInfo', additionalInfoArray);
    for (const info of additionalInfoArray) {
        await createReminder(info);
    }
}

module.exports = createWhatsappReminders;