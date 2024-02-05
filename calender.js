const { fetchClassInvitations, insertClassInvitation} = require('./dao/classIdToInviteMapping');
const inviteInfo = require('./inviteInfo'); // Import the module
// const saveEventId = require('./updateEventId'); // Import the module
const classIdTimingMap = require('./sheets/classIdTimingMap');
const classCancelltionInfo = require('./sheets/classCancellationInfo');
const ClassUtility = require('./utils/subClassUtility');

const calendarInvite = async (personDetails) => {

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

    const updateEventAndAttendees = async (auth, calendar, eventId, personDetails) => {
        try {
          // Get the existing attendees from the event before updating
          const existingEvent = await calendar.events.get({
            auth: auth,
            calendarId: 'primary',
            eventId: eventId,
          });
      
          const existingAttendees = existingEvent.data.attendees || [];
      
          // Add the new attendee to the list
          const newAttendee = {'email': personDetails.email};
          const updatedAttendees = [...existingAttendees, newAttendee];
      
          // Create the update object with the updated attendees
          const updateEvent = {
            'attendees': updatedAttendees,
          };
      
          // Perform the update
          const updatedEvent = await calendar.events.patch({
            auth: auth,
            calendarId: 'primary',
            eventId: eventId,
            resource: updateEvent,
          });
      
        } catch (err) {
          console.log('Error updating event:', err);
        }
      };


    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async function listEvents(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    
    const childName = personDetails.childName;
    const invitesInfo =  await inviteInfo();
    const classInviteIds = await fetchClassInvitations();
    const classIdTimings = await classIdTimingMap();
    const classStartTimesMap = await classCancelltionInfo();
    // console.log('classInviteIds',classInviteIds);
    personDetails.classDetails.forEach((classDetail) => {
        const { classid,className,classTag} = classDetail;
        const inviteClassInfo = invitesInfo[classid];
        // console.log('inviteClassInfo',inviteClassInfo);
        if(inviteClassInfo!=undefined){
            
            let timeslots = classDetail.timeslots;
            timeslots.filter((timeslot1) => !timeslot1.isPast)
            .forEach((timeslot) => {
                const { timing, subClassId } = timeslot;
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

                        const startDateTime = convertToDateTimeFormat(userStartDateTime);
                        const endDateTime = convertToDateTimeFormat(userEndDateTime);
                        
let eventDescription = `
Hello there!

Thank you for registering for "${modifiedClassName}" !

<b><i>We kindly request you to switch on the learner's camera at the start of the class for a quick identity check. After confirmation, learners may choose to participate with the camera off.</i></b>

Here's everything you need to know:

`;

if (classStartTimesMap[classid][1] !== undefined && classStartTimesMap[classid][1] !== '' && classStartTimesMap[classid][1].toLowerCase() !== 'there are no prerequisites needed for the class.') {
    eventDescription += `Prerequisites: ${classStartTimesMap[classid][1]}\n`;
}

if (classStartTimesMap[classid][1] !== undefined && classStartTimesMap[classid][1] !== '' && inviteClassInfo[5] !== undefined && inviteClassInfo[5] !== '') {
    eventDescription += '\n';
}

if (inviteClassInfo[5] !== undefined && inviteClassInfo[5] !== '') {
    eventDescription += `Class Material: ${inviteClassInfo[5]}\n`;
}

eventDescription += `
Meeting Link: ${classStartTimesMap[classid][4]}
Meeting ID: ${classStartTimesMap[classid][5]}
Passcode: ${classStartTimesMap[classid][6]}

Class time includes a 10-minute feedback session. We kindly request the learner to stay back, and share their class experience with us.

Happy Learning!
`.trim();

                        var event = {
                        'summary':  ` Coral Academy : ${modifiedClassName}`,
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
                            {'email': personDetails.email,'visibility': 'private',},
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
                        },
                        'guestsCanSeeOtherGuests':false
                        };
                        calendar.events.insert(
                            {
                            auth: auth,
                            calendarId: 'primary', // or the calendar ID where you want to create the event
                            resource: event,
                            },
                            (err, response) => {
                            if (err) {
                                console.error('Error creating event:', err);
                                return;
                            }
                        
                            // Extract the event ID from the response
                            const eventId = response.data.id;
                            console.log('Event created successfully. Event ID:', eventId);
                            insertClassInvitation(subClassId,eventId);
                            }
                        );
                        
                    }else{
                    
                        // console.log('Will update event in this case',subClassId);
                        updateEventAndAttendees(auth, calendar, classInviteId, personDetails);


                    }
                     
            
            
            });
        }
        });
      

}

authorize().then(listEvents).catch(console.error);



}catch (err) {
    console.error('Error sending clender invite ', err);
}

};


module.exports = calendarInvite;