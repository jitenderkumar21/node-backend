const { Client } = require('pg');
const ClassUtility = require('../utils/subClassUtility');
const moment = require('moment-timezone');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

async function createReminder(info,reminderTime,reminderType) {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();

        // Drop class_id from additionalInfo before the insert query
        const infoWithoutClassId = { ...info };
        // delete infoWithoutClassId.class_id;
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
            values: [infoWithoutClassId, reminderTime, info.subClassId, info.email, info.kidName,reminderType],
        };

        await client.query(query);

        console.log(`Reminder for ${info.teacherName}'s class (${info.className}) created successfully.`);
    } catch (error) {
        console.error(`Error creating/updating reminder for ${info.teacherName}'s class (${info.className}):`, error.message);
    } finally {
        await client.end();
    }
}

function calculateMorningReminderTime(classStartTime,userTimeZone) {
    let timeZoneAbbreviation = userTimeZone;
    let classStartTimeMoment;
    let reminderTimeMoment;
    if(timeZoneAbbreviation=='MST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(15, 'hours');
    }else if(timeZoneAbbreviation=='EST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(13, 'hours');
    }else if(timeZoneAbbreviation=='CST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(14, 'hours');
    }else{
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(16, 'hours');
    }
    return reminderTimeMoment.toISOString();
}

async function createTeacherReminder(subClassId, className, teacherInviteInfo,classIdTimings) {
    const classIdTimingMap = classIdTimings.get(subClassId);
    const dateMonthAndDay = ClassUtility.getdateMonthAndDay(classIdTimingMap[0]);
    const classStartTime = ClassUtility.getClassStartTime(teacherInviteInfo[8],classIdTimingMap[0],classIdTimingMap[1]);
    const reminderInfo = {
        email:teacherInviteInfo[2].split(',')[0],
        teacherName: teacherInviteInfo[1],
        className: className,
        DayandDate: dateMonthAndDay,
        classTime: classStartTime,
        subClassId: subClassId,
        zoomMeetingLink: teacherInviteInfo[5],
        meetingId: teacherInviteInfo[6],
        passcode: teacherInviteInfo[7],
    };

    const morningReminderTime = calculateMorningReminderTime(classIdTimingMap[0],teacherInviteInfo[8]);
    const reminderType = 'TEACHER_REMINDER'; 

    await createReminder(reminderInfo, morningReminderTime, reminderType);

    console.log(`Teacher reminder for ${className} created successfully.`);
}


module.exports = createTeacherReminder;