const inviteInfo = require('./inviteInfo'); // Import the module
const saveEventId = require('./updateEventId'); // Import the module
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
    

    const invitesInfo =  await inviteInfo();

    personDetails.classDetails.forEach((classDetail) => {
        const { classid } = classDetail;
        const inviteClassInfo = invitesInfo[classid];
        if(inviteClassInfo!=undefined){
            
            let timeslot = classDetail.timeslot;
            if (timeslot){
                const prefix = "want another slot";
                if(!(timeslot.toLowerCase().startsWith(prefix))){
                    if(inviteClassInfo[3]==undefined){
                        // const userStartDateTime = '2023-11-19 17:00';  // Replace this with the user's input
                        // const userEndDateTime = '2023-11-19 18:00';    // Replace this with the user's input
                        const userStartDateTime =inviteClassInfo[1];  // Replace this with the user's input
                        const userEndDateTime = inviteClassInfo[2];    // Replace this with the user's input
                
                        const convertToDateTimeFormat = (userDateTime) => {
                        const formattedDateTime = momentTime.utc(userDateTime, 'YYYY-MM-DD HH:mm').format();
                        return formattedDateTime;
                        };

                        const startDateTime = convertToDateTimeFormat(userStartDateTime);
                        const endDateTime = convertToDateTimeFormat(userEndDateTime);
                        
const eventDescription = `
Hello there!

Thank you for registering your child for "${inviteClassInfo[0]}" Class!

<b><i>We kindly request you to switch on the learner's camera at the start of the class for a quick identity check. After confirmation, learners may choose to participate with the camera off</i></b>.

Here's everything you need to know:

Class Duration: (50 Minutes Class + 10 Minutes Feedback)

${inviteClassInfo[5] ? `Class Material: ${inviteClassInfo[5]}\n` : ''}
Zoom Meeting Link: https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09

Meeting ID: 329 424 0234
Passcode: 123456

Happy Learning!
`;

                        var event = {
                        'summary': inviteClassInfo[0],
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
                            {'email': 'aishwarya@coralacademy.com', 'visibility': 'private'},
                            {'email': 'shagun@coralacademy.com', 'visibility': 'private'},
                            {'email': 'aneesh@coralacademy.com', 'visibility': 'private'},
                            
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
                            saveEventId(inviteClassInfo[4],eventId);
                            }
                        );
                        
                    }else{
                    

                        updateEventAndAttendees(auth, calendar, inviteClassInfo[3], personDetails);


                    }
                     
            
                }
            }
        }
        });
      

}

authorize().then(listEvents).catch(console.error);



}catch (err) {
    console.error('Error sending clender invite ', err);
}

};


module.exports = calendarInvite;