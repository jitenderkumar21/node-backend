const axios = require('axios')

const clientId = "omanfWkISBODhuesrQIosg"
const accountId = "rWK2Ey6HSdWt2NhILNZ2oQ"
const clientSecret = "jOkjl4Wjnuca3O6uQrvMAFXW0HaJGV9z"
const auth_token_url = "https://zoom.us/oauth/token"
const api_base_url = "https://api.zoom.us/v2"

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=rWK2Ey6HSdWt2NhILNZ2oQ',
    headers: {
        'Authorization': 'Basic b21hbmZXa0lTQk9EaHVlc3JRSW9zZzpqT2tqbDRXam51Y2EzTzZ1UXJ2TUFGWFcwSGFKR1Y5eg=='
    }
};
const createMeeting = async (topic, duration, start_time) => {
    try{
        let authResponse
        await axios.request(config)
            .then((response) => {
              authResponse = response.data;
            })
            .catch((error) => {
                console.log(error);
            });

        const access_token = authResponse.access_token

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }


        let data = JSON.stringify({
            "topic": topic,
            "type": 2,
            "start_time": '2024-01-27T10:00:00Z',
            "duration": 60,
            "password": "12334",
            "settings": {
                "join_before_host": true,
                "waiting_room": false
            }
        });

        const meetingResponse = await axios.post(`${api_base_url}/users/me/meetings`, data, { headers });

        if (meetingResponse.status !== 201) {
            // return default meeting details from here
            return 'Unable to generate meeting link'
        }

        const response_data = meetingResponse.data;

        const content = {
            meeting_url: response_data.join_url,
            meeting_id: response_data.id,
            meetingTime: response_data.start_time,
            purpose: response_data.topic,
            duration: response_data.duration,
            message: 'Success',
            password: response_data.password,
            status: 1,
        };
        console.log(content);
        return content

    }catch (e) {
        // return default meeting details from here
        console.log(e)
    }
}
module.exports = createMeeting;