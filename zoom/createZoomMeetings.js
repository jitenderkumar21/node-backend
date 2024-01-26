const getMeetingInfo = require('../sheets/getMeetingInfo');
const createMeeting = require('./createMeeting');
const saveZoomMeeting = require('../sheets/saveZoomMeeting');

const createZoomMeetings = async (personDetails) => {
    const meetingsInfo = await getMeetingInfo();
    console.log('meetingsInfo',meetingsInfo);

    const processClassDetail = async (classDetail) => {
        const { classid } = classDetail;
        const meetingInfo = meetingsInfo[classid];
        let zoomMeetingLink = 'https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09';
        let meetingId = '3294240234';
        let passCode = '123456';

        if (meetingInfo !== undefined && meetingInfo[0] === undefined) {
            try {
                let meetingDetails = await createMeeting(classDetail.className, 60, 'start time');
                zoomMeetingLink = meetingDetails.meeting_url;
                meetingId = meetingDetails.meeting_id;
                passCode = meetingDetails.password;
            } catch (error) {
                console.error('Error creating Zoom meeting for classid:', classid, error);
            }
        }

        if (meetingInfo !== undefined && meetingInfo[1] !== undefined) {
            try {
                await saveZoomMeeting(meetingInfo[1], zoomMeetingLink, meetingId, passCode);
            } catch (error) {
                console.error('Error saving Zoom meeting for classid:', classid, error);
            }
        }
    };

    // Loop through classDetails and process each one asynchronously
    for (const classDetail of personDetails.classDetails) {
        await processClassDetail(classDetail);
    }
};

module.exports = createZoomMeetings;