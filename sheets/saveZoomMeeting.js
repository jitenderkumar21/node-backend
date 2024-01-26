const { google } = require('googleapis');

const saveZoomMeeting = async (index, meeting_url,meeting_id,meeting_passcode) => {
  try {
    console.log('Saving meeting for: ',meeting_url,meeting_id,meeting_passcode);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });


    // Create client instance for auth
    const client = await auth.getClient();

    const spreadsheetId = '1PEWxWS0HzyFgwMdOTktj9eh8o0WQS2z7azKHs5zMjk4';

    if (index!=undefined) {
        
        google.sheets({ version: 'v4', auth: client }).spreadsheets.values.update({
          auth,
          spreadsheetId,
          range: `Sheet1!W${index + 1}:Y${index + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[meeting_url,meeting_id,meeting_passcode]], // Provide the new value to be inserted
          },
        });
      }

  } catch (err) {
    console.error('Error saving zoom meeting details in google sheet', err);
  }
};

module.exports = saveZoomMeeting;
