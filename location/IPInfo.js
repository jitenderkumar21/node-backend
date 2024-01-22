const axios = require('axios');

const getIpInfo = async (ipAddress) => {
    
    // https://ipinfo.io
    const apiKey = '96b8e27dafaaca';

    const apiUrl = `https://ipinfo.io/${ipAddress}?token=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        const ipInfo = response.data;
        console.log('IP Information:', ipInfo);
        return ipInfo;
    } catch (error) {
        console.error('Error fetching IP information:', error.message);
        return null;
    }
};

module.exports = getIpInfo;
