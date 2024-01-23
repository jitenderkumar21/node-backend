const nodemailer = require('nodemailer');
const path = require('path');

const parentReminderEmail = (reminderId,reminder_type, additionalInfo) => {
        const parentName = additionalInfo.parentName;
        const kidName = additionalInfo.kidName;
        const className = additionalInfo.className;
        const classTiming = additionalInfo.classTiming;
        const prerequisite = additionalInfo.prerequisites;

        // Hardcoded Zoom meeting details
        const zoomMeetingLink = additionalInfo.zoomMeetingLink;
        const meetingId = additionalInfo.meetingId;
        const passcode = additionalInfo.passcode;
    const ATTACHMENT_PATH = path.join(process.cwd(), 'assets/Coral Academy Background.png');
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'xcvf sxnm yctg jvte',
        },
      });

      let emailContent;
      if(reminder_type==='MORNING_8_EMAIL'){
        emailContent = `
        <html>
        <head>
          <title>Demo Registration Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
        
            .container {
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin: 0 auto;
              width: 80%;
            }
        
            h1 {
              color: #333;
              font-size: 24px;
            }
        
            p {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
            }
        
          </style>
        </head>
        <body>
          <div class="container">
            <p>Hello ${parentName}</p>
            <p>Just a quick reminder that ${kidName}'s class is scheduled for today. Please make sure ${kidName} is in a quiet space for learning!</p>
  
            <p>Here are more details about the class:</p>
  
            <p>- Class Name: ${className}</p>
            <p>- Class Timing: ${classTiming}</p>
            <p>- Prerequisite: ${prerequisite}</p>
            <p>Zoom Meeting Link: ${zoomMeetingLink}</p>
            <p>Meeting ID: ${meetingId}</p>
            <p>Passcode: ${passcode}</p>
  
            <p>We would request you to join class with your video on, so that our team can verify the learner's identity.</p>
            <p>If you have any questions or if your kid cannot join today, feel free to text us back!</p>
            <p>Excited to see your kid in the class!</p>
            
            <p>Best Regards</p>
            <p>Coral Academy</p>
          
          </div>
        </body>
        </html>
        `;
      }else{
        emailContent = `
      <html>
      <head>
        <title>Demo Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
      
          .container {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin: 0 auto;
            width: 80%;
          }
      
          h1 {
            color: #333;
            font-size: 24px;
          }
      
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
          }
      
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hello ${parentName}</p>
          <p>Just a friendly reminder that ${kidName}'s class is in 15 Minutes. Please make sure ${kidName} is prepared for class.</p>

          <p>Class Details</p>

          <p>- Class Name: ${className}</p>
          <p>- Class Timing: ${classTiming}</p>
          <p>- Prerequisite: ${prerequisite}</p>
          <p>Zoom Meeting Link: ${zoomMeetingLink}</p>
          <p>Meeting ID: ${meetingId}</p>
          <p>Passcode: ${passcode}</p>

          <p>We would request you to join class with your video on, so that our team can verify the learner's identity.</p>
          <p>If you have any questions or if your kid cannot join today, feel free to text us back!</p>
          <p>We hope to see ${kidName} in class!</p>
          
          <p>Best Regards</p>
          <p>Coral Academy</p>
        
        </div>
      </body>
      </html>
      `;

      }
      
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:additionalInfo.email, // Sender's email address'
        subject: `Reminder for ${kidName}'s class today : ${className}`,
        html:emailContent,
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email reminder to parent for ID::', error);
        } else {
          console.log('Reminder Email sent to parent for ID:', reminderId);
        }
      });

  };
  
  module.exports = parentReminderEmail;