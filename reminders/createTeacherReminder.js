const { Client } = require('pg');
const ClassUtility = require('../utils/subClassUtility');
const moment = require('moment-timezone');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

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
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(7, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(14, 'hours');
    }else if(timeZoneAbbreviation=='EST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(7, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(12, 'hours');
    }else if(timeZoneAbbreviation=='CST'){
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(7, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(13, 'hours');
    }else{
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(7, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(15, 'hours');
    }
    return reminderTimeMoment.toISOString();
}

async function createTeacherReminder(subClassId, className, subClassDTO,classIdTimings) {
    try{
        console.log('Creating teacher reminder for subClassid:',subClassId);
        console.log('Creating teacher reminder for className:',className);
        const classIdTimingMap = classIdTimings.get(subClassId);
        const dateMonthAndDay = ClassUtility.getdateMonthAndDay(classIdTimingMap[0]);
        const classStartTime = ClassUtility.getClassStartTime(subClassDTO.teacherTimezone,classIdTimingMap[0],classIdTimingMap[1]);
        const reminderInfo = {
            email:subClassDTO.teacherEmail.split(',')[0],
            teacherName: subClassDTO.teacherName,
            className: className,
            DayandDate: dateMonthAndDay,
            classTime: classStartTime,
            subClassId: subClassId,
            zoomMeetingLink: subClassDTO.zoomMeetingLink,
            meetingId: subClassDTO.meetingId,
            passcode: subClassDTO.passcode,
        };

        const morningReminderTime = calculateMorningReminderTime(classIdTimingMap[0],subClassDTO.teacherTimezone);
        const reminderType = 'TEACHER_REMINDER'; 

        await createReminder(reminderInfo, morningReminderTime, reminderType);

        console.log(`Teacher reminder for ${className} created successfully.`);
    }catch(err) {
        console.log('Error creating teacher reminder for classId:',subClassId);
    }
}


module.exports = createTeacherReminder;