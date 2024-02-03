const teacherInviteInfo = require('./teacherInviteInfo'); // Import the module
const {
    sendEmailToTeacher,
    createTableAndSendEmail,
    createTableForCoursesAndSendEmail,
  } = require('./emails/teacherEmail');
const moment = require('moment-timezone');
const classIdTimingMap = require('./sheets/classIdTimingMap');
const ClassUtility = require('./utils/subClassUtility');
const { fetchClassInvitations, insertClassInvitation} = require('./dao/classIdToInviteMapping');

const teacherCalendar = async (personDetails) => {

try{
    const fs = require('fs').promises;
    const path = require('path');
    const process = require('process');
    const {authenticate} = require('@google-cloud/local-auth');
    const {google} = require('googleapis');
    const momentTime = require('moment');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/calendar'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = path.join(process.cwd(), 'token.json');
    const CREDENTIALS_PATH = path.join(process.cwd(), 'calenderCridentials.json');

    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
     */
    async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
    }

    /**
     * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
    }

    /**
     * Load or request or authorization to call APIs.
     *
     */
    async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
    }


    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async function listEvents(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    

    const invitesInfo =  await teacherInviteInfo();
    const classIdTimings = await classIdTimingMap();
    const classInviteIds = await fetchClassInvitations();

    personDetails.classDetails.forEach((classDetail) => {
        const { classid,className,classTag} = classDetail;
        const inviteClassInfo = invitesInfo[classid];
        // console.log('Sending Teacher invite for ',inviteClassInfo);
        if(inviteClassInfo!=undefined){
            let timeslots = classDetail.timeslots;
            let courseTimeslots = [];
            timeslots.filter((timeslot1) => !timeslot1.isPast)
                .forEach((timeslot) => {
                    const { timing, subClassId } = timeslot;
                    // console.log('Sending Teacher invite for subClassId',subClassId);
                    const classInviteId = classInviteIds[subClassId];
                    // console.log('classInviteId',classInviteId);
                    const modifiedClassName = ClassUtility.getModifiedClassName(subClassId,className,classTag);
                    // console.log('Modified class name',modifiedClassName);
                    if(classInviteId==undefined){
        
                        const userStartDateTime =classIdTimings.get(subClassId)[0];  // Replace this with the user's input
                        const userEndDateTime = classIdTimings.get(subClassId)[1];    // Replace this with the user's input
                        const convertToDateTimeFormat = (userDateTime) => {
                            const formattedDateTime = momentTime.utc(userDateTime, 'YYYY-MM-DD HH:mm').format();
                            return formattedDateTime;
                        };
                        let classStartTime = moment(userStartDateTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
                        let classEndTime = moment(userEndDateTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
                        let displayClassTime = '';
                        const timeZoneAbbreviation = 'PST';
                        if (classStartTime.isValid() && classEndTime.isValid()) {
                            const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h:mm A');
                            const formattedClassEndTime = classEndTime.format('h:mm A');
                            displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
                          }
                        const lowercaseClassTag = classTag.toLowerCase();

                        if (lowercaseClassTag === 'ongoing' || lowercaseClassTag === 'onetime') {
                            createTableAndSendEmail(timeslot,classTag,className,[...inviteClassInfo,displayClassTime],classIdTimings);    
                        }else if (lowercaseClassTag === 'course'){
                            // console.log('Push timeslot to courseTimeslots for',subClassId);
                            courseTimeslots.push(timeslot);
                        }                     
                        const startDateTime = convertToDateTimeFormat(userStartDateTime);
                        const endDateTime = convertToDateTimeFormat(userEndDateTime);
                        

                        let eventSummary = `Coral Academy: ${modifiedClassName}`;
                        
const eventDescription = `
Hi ${inviteClassInfo[1]},

We are blocking your calendar for ${displayClassTime}.

Zoom details mentioned below :

Meeting Link: ${inviteClassInfo[5]}
Meeting ID: ${inviteClassInfo[6]}
Passcode: ${inviteClassInfo[7]}

- Please verify learners with a quick video check-in at the start of each class to visually ensure that the learner is a child.After check-in, they can turn off the video. If a learner is unwilling or unable to enable video, kindly remove them from the class.

- Please email class materials & any homework to us if you haven't already. Include the deadline for homework submissions and we'll inform parents & pass on the homework to you.

Thankyou!
`;


                        var event = {
                        'summary': eventSummary,
                        'location': 'https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09',
                        'description': eventDescription,
                        'start': {
                            'dateTime': startDateTime,
                            'timeZone': 'Asia/Kolkata',
                        },
                        'end': {
                            'dateTime': endDateTime,
                            'timeZone': 'Asia/Kolkata',
                        },
                        'attendees': [
                            {'email': 'shivam@coralacademy.com', 'visibility': 'private'},
                            {'email': 'shagun@coralacademy.com', 'visibility': 'private'},
                            {'email': 'anisha@coralacademy.com', 'visibility': 'private'},
                            
                        ],
                        'reminders': {
                            'useDefault': false,
                            'overrides': [
                            {'method': 'email', 'minutes': 2 * 60},
                            {'method': 'popup', 'minutes': 10},
                            ],
                        }
                        };
                        var teacherEmails = inviteClassInfo[2].split(',');
                        for (var i = 0; i < teacherEmails.length; i++) {
                            event.attendees.push({'email': teacherEmails[i].trim(), 'visibility': 'private'});
                        }

                        calendar.events.insert(
                            {
                            auth: auth,
                            calendarId: 'primary', // or the calendar ID where you want to create the event
                            resource: event,
                            sendUpdates: 'all',
                            },
                            (err, response) => {
                            if (err) {
                                console.error('Error creating event:', err);
                                return;
                            }
                        
                            // Extract the event ID from the response
                            const eventId = response.data.id;
                            console.log(`Teacher Event created successfully for emails: ${teacherEmails} . Event ID:`, eventId);
                            }
                        );
                                   
                }
            });
            if (courseTimeslots.length > 0) {
                // console.log('Sending Teacher email for courseTimeslots',courseTimeslots);
                createTableForCoursesAndSendEmail(courseTimeslots,className,inviteClassInfo,classIdTimings);
              }
        }
        });
      

}

authorize().then(listEvents).catch(console.error);



}catch (err) {
    console.error('Error sending clender invite to teacher', err);
}

};


module.exports = teacherCalendar;