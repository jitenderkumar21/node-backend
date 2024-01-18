const { Client } = require('pg');
const classCancelltionInfo = require('./sheets/classCancellationInfo'); // Import the module
const moment = require('moment-timezone');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

function createAdditionalInfo(data, classStartTimesMap) {
    return data.classDetails.map(detail => {
        const classTiming = detail.timeslot;
        const classStartTime = classStartTimesMap[detail.classid][2] || null; // Fetch classStartTime from the map

        return {
            parentName: data.parentName,
            kidName: data.childName,
            className: detail.className,
            classTiming: classTiming,
            classStartTime: classStartTime,
            class_id: detail.classid, // Add class_id to the object
            receiverNumber: data.phoneNumber,
            prerequisites: classStartTimesMap[detail.classid][1],
            zoomMeetingLink: classStartTimesMap[detail.classid][4],
            meetingId: classStartTimesMap[detail.classid][5],
            passcode:classStartTimesMap[detail.classid][6],
        };
    });
}

async function createReminder(info,reminderTime,reminderType) {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();

        // Drop class_id from additionalInfo before the insert query
        const infoWithoutClassId = { ...info };
        delete infoWithoutClassId.class_id;
        delete infoWithoutClassId.classStartTime;

        const query = {
            text: `
                INSERT INTO reminders (additional_info, reminder_time, class_id, phone_number,reminder_type)
                VALUES ($1, $2, $3, $4,$6)
                ON CONFLICT (class_id, phone_number,reminder_type)
                DO UPDATE SET
                    additional_info = jsonb_set(
                        COALESCE(reminders.additional_info, '{}'::jsonb),
                        '{kidName}',
                        to_jsonb(COALESCE(reminders.additional_info->>'kidName', '') || ', ' || $5),
                        true
                    ),
                    reminder_time = $2
            `,
            values: [infoWithoutClassId, reminderTime, info.class_id, info.receiverNumber, info.kidName,reminderType],
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
    // Assuming classStartTime is a string in "YYYY-MM-DD HH:mm" format in UTC
    let reminderTime = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(15, 'minutes');
    // console.log('reminderTime', reminderTime);
    return reminderTime.toISOString(); // Converts to PostgreSQL timestamp format
}
function calculateMorningReminderTime(classStartTime,userTimeZone) {
    let timeZoneAbbreviation = moment.tz([2023, 0], userTimeZone).zoneAbbr();
    let classStartTimeMoment;
    let reminderTimeMoment;
    if(timeZoneAbbreviation=='MST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(7, 'hours');
    }else if(timeZoneAbbreviation=='EST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(5, 'hours');
    }else if(timeZoneAbbreviation=='CST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(6, 'hours');
    }else{
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
    }
    return reminderTimeMoment.toISOString(); // Converts to PostgreSQL timestamp format
}
function cleanPhoneNumber(phoneNumber) {
    // Remove characters like '=', '(', ')' and keep only digits
    return phoneNumber.replace(/[^0-9]/g, '');
  }  

async function createWhatsappReminders(jsonData,userTimeZone) {
    const classStartTimesMap = await classCancelltionInfo();
    // console.log('classStartTimesMap', classStartTimesMap);
    jsonData.phoneNumber = cleanPhoneNumber(jsonData.phoneNumber);
    const additionalInfoArray = createAdditionalInfo(jsonData, classStartTimesMap);
    // console.log('additionalInfo', additionalInfoArray);
    for (const info of additionalInfoArray) {
        const beforeClassReminderTime = calculateReminderTime(info.classStartTime);
        const morningReminderTime = calculateMorningReminderTime(info.classStartTime,userTimeZone);
        // console.log('beforeClassReminderTime',beforeClassReminderTime);
        // console.log('morningReminderTime',morningReminderTime);
        await createReminder(info,beforeClassReminderTime,'BEFORE_CLASS_15');
        await createReminder(info,morningReminderTime,'MORNING_8');
        await createReminder(info,beforeClassReminderTime,'BEFORE_CLASS_15_P');
        await createReminder(info,morningReminderTime,'MORNING_8_P');
    }
}


module.exports = createWhatsappReminders;