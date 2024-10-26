const { Client } = require('pg');
const getSubClassesInfo = require('./sheets/getSubClassesInfo');
const moment = require('moment-timezone');
const ClassUtility = require('./utils/subClassUtility');
const classIdTimingMap = require('./sheets/classIdTimingMap');
require('dotenv').config();


const connectionString = process.env.DATABASE_URL;

function createAdditionalInfo(data,userTimeZone, subClassesInfo,classIdTimings) {
    const finalJson = [];
    
    data.classDetails.forEach(detail => {
    
        detail.timeslots.filter(timeslot => !timeslot.isPast && !timeslot.isWaitlist)
        .forEach(timeslot => {
        const subClassId = timeslot.subClassId;
        const subClassDTO = subClassesInfo[subClassId];
        const classIdTimingMap = classIdTimings.get(subClassId);
        // console.log(subClassId,classIdTimingMap);
        const classDisplayTiming = ClassUtility.getClassDisplayTiming(userTimeZone,classIdTimingMap[0],classIdTimingMap[1]);
        const modifiedClassName = ClassUtility.getModifiedClassNameV2(subClassId,detail.className,detail.classTag);
        const row = {
            parentName: data.parentName,
            kidName: data.childName,
            email: data.email,
            className: modifiedClassName,
            classTiming: classDisplayTiming,
            classStartTime: classIdTimingMap[0],
            classId: detail.classid,
            subClassId: subClassId,
            receiverNumber: data.phoneNumber,
            zoomMeetingLink: subClassDTO.zoomMeetingLink,
            meetingId: subClassDTO.meetingId,
            passcode: subClassDTO.passcode,
        };

        finalJson.push(row);
        });
    });

    return finalJson;


    // return data.classDetails.map(detail => {
    //     const classTiming = detail.timeslot;
    //     const classStartTime = classStartTimesMap[detail.classid][2] || null; // Fetch classStartTime from the map

    //     return {
    //         parentName: data.parentName,
    //         kidName: data.childName,
    //         className: detail.className,
    //         email:data.email,
    //         classTiming: classTiming,
    //         classStartTime: classStartTime,
    //         class_id: detail.classid, // Add class_id to the object
    //         receiverNumber: data.phoneNumber,
    //         prerequisites: classStartTimesMap[detail.classid][1],
    //         zoomMeetingLink: classStartTimesMap[detail.classid][4],
    //         meetingId: classStartTimesMap[detail.classid][5],
    //         passcode:classStartTimesMap[detail.classid][6],
    //     };
    // });
}

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
        classStartTimeMoment = moment.utc(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(8, 'hours');
        if (classStartTimeMoment.isBefore(reminderTimeMoment)) {
            reminderTimeMoment.subtract(1, 'day');
        }    
        reminderTimeMoment = classStartTimeMoment.clone().startOf('day').add(16, 'hours');
    }
    return reminderTimeMoment.toISOString(); // Converts to PostgreSQL timestamp format
}
function cleanPhoneNumber(phoneNumber) {
    // Remove characters like '=', '(', ')' and keep only digits
    return phoneNumber.replace(/[^0-9]/g, '');
  }  

async function createWhatsappReminders(jsonData,userTimeZone) {
    const subClassesInfo = await getSubClassesInfo();
    const classIdTimings = await classIdTimingMap();
    // console.log('classStartTimesMap', classStartTimesMap);
    // console.log('classIdTimings', classIdTimings);
    // jsonData.phoneNumber = cleanPhoneNumber(jsonData.phoneNumber);
    const additionalInfoArray = createAdditionalInfo(jsonData,userTimeZone, subClassesInfo,classIdTimings);
    const communicationPreference = jsonData.commPref;
    // console.log('additionalInfo', additionalInfoArray);
    for (const info of additionalInfoArray) {
        console.log(info);
        const prefix = "want another slot";
        let timeslot = info.classTiming;
        if(timeslot!=undefined && !(timeslot.toLowerCase().startsWith(prefix)) && info.receiverNumber!=undefined && info.receiverNumber!=''){
            const beforeClassReminderTime = calculateReminderTime(info.classStartTime);
            const morningReminderTime = calculateMorningReminderTime(info.classStartTime,userTimeZone);
            // console.log('beforeClassReminderTime',beforeClassReminderTime);
            // console.log('morningReminderTime',morningReminderTime);
            // await createReminder(info,beforeClassReminderTime,'BEFORE_CLASS_15');
            // await createReminder(info,morningReminderTime,'MORNING_8');
            // await createReminder(info,beforeClassReminderTime,'BEFORE_CLASS_15_P');
            // await createReminder(info,morningReminderTime,'MORNING_8_P');
        }if(timeslot!=undefined && !(timeslot.toLowerCase().startsWith(prefix)) && ( communicationPreference.includes('Email') || communicationPreference.includes('WhatsApp') || communicationPreference.includes('Text') ) ){
            const beforeClassReminderTime = calculateReminderTime(info.classStartTime);
            const morningReminderTime = calculateMorningReminderTime(info.classStartTime,userTimeZone);
            // console.log('beforeClassReminderTime',beforeClassReminderTime);
            // console.log('morningReminderTime',morningReminderTime);
            createReminder(info,beforeClassReminderTime,'BEFORE_CLASS_15_EMAIL');
            createReminder(info,morningReminderTime,'MORNING_8_EMAIL');
        }
    }
}


module.exports = createWhatsappReminders;