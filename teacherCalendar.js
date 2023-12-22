const teacherInviteInfo = require('./teacherInviteInfo'); // Import the module
const moment = require('moment-timezone');

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
    console.log(personDetails);

    personDetails.classDetails.forEach((classDetail) => {
        const { classid } = classDetail;
        const inviteClassInfo = invitesInfo[classid];
        console.log('Sending invite for ',inviteClassInfo);
        if(inviteClassInfo!=undefined){
            
            if (inviteClassInfo[5]==undefined){
                const prefix = "want another slot";
                let timeslot = classDetail.timeslot;
                if(timeslot!=undefined && !(timeslot.toLowerCase().startsWith(prefix))){
                    if(inviteClassInfo[3]!=undefined && inviteClassInfo[4]!=undefined){
                        // const userStartDateTime = '2023-11-19 17:00';  // Replace this with the user's input
                        // const userEndDateTime = '2023-11-19 18:00';    // Replace this with the user's input
                        const userStartDateTime =inviteClassInfo[3];  // Replace this with the user's input
                        const userEndDateTime = inviteClassInfo[4];    // Replace this with the user's input
                        console.log('userStartDateTime',userStartDateTime);
                        console.log('userEndDateTime',userEndDateTime);

                        const convertToDateTimeFormat = (userDateTime) => {
                        const formattedDateTime = momentTime.utc(userDateTime, 'YYYY-MM-DD HH:mm').format();
                        return formattedDateTime;
                        };
                        let classStartTime = moment(userStartDateTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
                        let classEndTime = moment(userEndDateTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
                        let displayClassTime = '';
                        const timeZoneAbbreviation = 'PST';
                        if (classStartTime.isValid() && classEndTime.isValid()) {
                            const formattedClassStartTime = classStartTime.format('D MMMM, dddd, h A');
                            const formattedClassEndTime = classEndTime.format('h A');
                            displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
                          }

                        const startDateTime = convertToDateTimeFormat(userStartDateTime);
                        const endDateTime = convertToDateTimeFormat(userEndDateTime);
                        

                        let eventSummary = `Coral Academy: ${inviteClassInfo[0]}`;
                        
const eventDescription = `
Hi ${inviteClassInfo[1]},

We are blocking your calendar for ${displayClassTime}.<b><i>Additionally, we would request you to confirm the learner's identity by requesting them to turn their cameras on at the beginning of the class. They can disable video after this if they wish. If verification fails, our team will cross-check if they have attended past classes from our record, and take necessary action within the first 5 minutes of class</i></b>.

Kindly find the joining details here as well:

Zoom Meeting Link: https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09

Meeting ID: 329 424 0234 
Passcode: 123456

Thank You!
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
                            {'email': inviteClassInfo[2],'visibility': 'private',},
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
                        }
                        };
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
                            console.log('Teacher Event created successfully. Event ID:', eventId);
                            }
                        );
                        
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


module.exports = teacherCalendar;