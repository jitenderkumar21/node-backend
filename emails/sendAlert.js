const nodemailer = require('nodemailer');

const sendAlert = async (reportData) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'support@coralacademy.com',
        pass: 'xcvf sxnm yctg jvte',
      },
    });

    // Email content
    const mailOptions = {
      from: 'support@coralacademy.com',
      to: 'support@coralacademy.com',
      cc: 'jitender.kumar@iitgn.ac.in',
      subject: 'Service Issue Notification',
      html: generateEmailContent(reportData),
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending notification email:', error);
      } else {
        console.log('Notification email sent successfully.');
      }
    });

  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// Function to generate email content
const generateEmailContent = (reportData) => {
    const { classId, channel, type, status, reason, parentEmail,childName, reminderId } = reportData;
  return `<p>Dear Support Team,</p>
          <p>An issue has been detected with the service. Details are as follows:</p>
          <p><strong>Class Id:</strong> ${classId}</p>
          <p><strong>Channel:</strong> ${channel}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Parent Email:</strong> ${parentEmail}</p>
          <p><strong>Child Name:</strong> ${childName}</p>
          <p><strong>Error Message:</strong> ${reason}</p>
          <p>Please take necessary actions to resolve the issue.</p>
          <p>Regards,<br/>Backend Team</p>`;
};

module.exports = sendAlert;