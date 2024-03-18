const ClassUtility = require('../utils/subClassUtility');
require('dotenv').config();

async function sendTeacherEmails(classDetails) {
    const invitesInfo = await teacherInviteInfo();
    const currentClient = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await currentClient.connect();

        classDetails.forEach(async (classDetail) => {

            classDetail.timeslots.forEach(async (timeslot) => {
                if (timeslot.subClassId) {
                    const subClassId = timeslot.subClassId;

                    // Find the corresponding subclass in the database
                    const result = await currentClient.query('SELECT * FROM sub_classes WHERE sub_class_id = $1', [subClassId]);

                    if (result.rows.length > 0) {
                        const teacherEmailStatus = result.rows[0].teacher_email_status;

                        if (teacherEmailStatus === 0) {
                            // If teacher_email_status is 0, send email and update status
                            const teacherInviteInfo = invitesInfo[classid];
                            teacherEmailInfo = {};
                            teacherEmailInfo['teacherEmail']=teacherInviteInfo[2].split(',')[0];
                            teacherEmailInfo['teacherName']=teacherInviteInfo[1];
                            teacherEmailInfo['className']=classDetail.className;
                            await sendEmailAndUpdateStatus(teacherEmailInfo);
                        } else {
                            // If teacher_email_status is 1, skip
                            console.log(`Skipping subClassId: ${subClassId} as teacher_email_status is already 1`);
                        }
                    }
                }
            });
            if(classDetail.classTag.toLowerCase() === 'course'){
                // send single teacher email here
            }
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        await currentClient.end();
    }
}

async function createTableForCourses(timeslots,className){
    let classes = `
                <table class="class-table">
                    <tr>
                        <th>Class Name</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
            `;
    
    if (timeslots && timeslots.length > 0) {
        // Filter out timeslots where isPast is true
        const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);

        futureTimeslots.forEach((timeslot) => {
            const { timing, subClassId } = timeslot;
            const classNumber = subClassId.split('_')[1]; // Assuming subClassId format is "33_1"

            // Append class number to the className
            const classNameWithNumber = `${className} Class ${classNumber}`;
            const classIdTimingMap = classIdTimingMap.get(subClassId);
            const dayAndMonth = ClassUtility.getDayAndMonth(classIdTimingMap[0]);
            classes += `
                <tr>
                    <td>${classNameWithNumber}</td>
                    <td>${dayAndMonth}</td>
                    <td>${classTag}</td>
                </tr>
            `;
        });
    }
    classes += `</table>`;
    return classes;
}

async function createTable(timeslot,classTag,className){
    let classes = `
                <table class="class-table">
                    <tr>
                        <th>Class Name</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
            `;

            const { timing, subClassId } = timeslot;
            const classNumber = subClassId.split('_')[1]; // Assuming subClassId format is "33_1"
            let classNameWithNumber = className;
            // Append class number to the className
            if(classTag.toLowerCase() === 'ongoing'){
                classNameWithNumber = `${className} Class ${classNumber}`;
            }
            const classIdTimingMap = classIdTimingMap.get(subClassId);
            const dayAndMonth = ClassUtility.getDayAndMonth(classIdTimingMap[0]);
            classes += `
                <tr>
                    <td>${classNameWithNumber}</td>
                    <td>${dayAndMonth}</td>
                    <td>${classTag}</td>
                </tr>
            `;
    classes += `</table>`;
    return classes;
}