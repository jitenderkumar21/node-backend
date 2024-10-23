const nodemailer = require('nodemailer');
const getSubClassesInfo = require('../sheets/getSubClassesInfo');
const path = require('path');
const { Client } = require('pg');
const {  insertSystemReport } = require('../dao/systemReportDao');
require('dotenv').config();
const moment = require('moment-timezone');
const ClassUtility = require('../utils/subClassUtility');
const classIdTimingMap = require('../sheets/classIdTimingMap');

const connectionString = process.env.DATABASE_URL;
const serviceBaseUrl = process.env.SERVICE_BASE_URL;
const supportEmailPassword = process.env.SUPPORT_EMAIL_PASSWORD;


const parentReminderEmail = async (reminderId,reminder_type, additionalInfo) => {
        let reportType = (reminder_type === 'MORNING_8_EMAIL') ? 'Parent Reminder 8AM' : 'Parent Reminder 15MIN';
        try{
        const subClassesInfo = await getSubClassesInfo();
        const classIdTimings = await classIdTimingMap();
        const subClassDTO = subClassesInfo[additionalInfo.subClassId];
        const parentName = additionalInfo.parentName;
        const kidName = additionalInfo.kidName;
        const classid = additionalInfo.classId;
        const classTimingIST = ClassUtility.getClassTimingInIST(classIdTimings,additionalInfo.subClassId);

        const namesArray = kidName.split(',').map(name => name.trim());
        let formattedNames;
        let isMultipleKids = false;
        if (namesArray.length >= 2) {
            formattedNames = namesArray.slice(0, -1).join(', ') + ` and ${namesArray[namesArray.length - 1]}`;
            isMultipleKids = true;
        } else {
            formattedNames = kidName;
        }
        // console.log('kidName',kidName);
        const className = additionalInfo.className;
        const classTiming = additionalInfo.classTiming;
        // const prerequisite = additionalInfo.prerequisites;

        // Hardcoded Zoom meeting details
        const zoomMeetingLink = additionalInfo.zoomMeetingLink;
        const meetingId = additionalInfo.meetingId;
        const passcode = additionalInfo.passcode;
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: supportEmailPassword,
        },
      });
      const date = new Date();
      const formattedTimestamp = moment(date).tz('Asia/Kolkata').format('DD MMM YYYY HH:mm');
      

      let emailContent;
      let trackingPixelUrl;
      let emailSubject = 'Reminder!';
      if(reminder_type==='MORNING_8_EMAIL' || reminder_type==='MORNING_8'){
        trackingPixelUrl = `${serviceBaseUrl}/track.gif?recipientEmail=${encodeURIComponent(additionalInfo.email)}&classID=${encodeURIComponent(classid)}&emailSentAt=${formattedTimestamp}&parentName=${encodeURIComponent(parentName)}&childName=${encodeURIComponent(kidName)}&className=${encodeURIComponent(className)}&classTiming=${encodeURIComponent(classTimingIST)}&type=PARENT_REMINDER_MORNING`;
        emailSubject=`Reminder for ${formattedNames}'s class today : ${className}`;
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
              padding: 2px;
              margin: 0 auto;
              width: 100%;
            }
        
            h1 {
              color: #333;
              font-size: 24px;
            }
        
            p {
              color: black;
              font-size: 16px;
              line-height: 1.6;
            }
            li {
              color: black;
              font-size: 16px;
              line-height: 1.6;
            }
        
          </style>
        </head>
        <body>
          <div class="container">
            <p>Hello ${parentName}</p>
            <p>This is a reminder for ${formattedNames}'s class scheduled today.</p>
  
            <p><strong>Class Name:</strong> ${className}</p>
            <p><strong>Date & Time:</strong> ${classTiming}</p>
            <p><strong>Zoom Meeting Details:</strong></p>
              <ul>
                <li><a href="${zoomMeetingLink}" target="_blank">Zoom Link</a></li>
                <li>Meeting ID: ${meetingId}</li>
                <li>Passcode: ${passcode}</li>
              </ul>
            `
            emailContent+=`<p>We value your feedback! If you've taken classes with us previously, please <a href="https://tinyurl.com/mwtydca7">review us on Trustpilot.</a></p>`;
            emailContent+=`<ul>`;

            if (subClassDTO && subClassDTO.prerequisite !== undefined && subClassDTO.prerequisite !== '' && subClassDTO.prerequisite.toLowerCase() !== 'there are no prerequisites needed for the class.') {
              emailContent += `<li><strong>Prerequisite</strong>: ${subClassDTO.prerequisite}</li>`;
            }
              
            if (subClassDTO.prerequisite !== undefined && subClassDTO.prerequisite !== '' && subClassDTO.classMaterial !== undefined && subClassDTO.classMaterial !== '') {
              emailContent += '\n';
            }
              
            if (subClassDTO && subClassDTO.classMaterial !== undefined && subClassDTO.classMaterial !== '') {
              emailContent += `<li><strong>Class Materials</strong>: ${subClassDTO.classMaterial}</li>`;
            }
        
            emailContent+=`
            <p><strong>Important Information:</strong></p>

            <li><strong>Identity Verification:</strong> Ensuring learner safety as our highest priority, we request you to switch on ${formattedNames}'s camera at the start of each class for a quick identity check. While ${formattedNames} can choose to keep it off afterward, we suggest keeping it on for a more interactive learning experience.</li>
            <li><strong>Class Entry:</strong> We request learners to join class on time to ensure an uninterrupted learning experience. <strong>Late entries may be restricted after the initial 10 minutes, to maintain the flow of class.</strong></li>
            <li><strong>Class Alerts:</strong> We have blocked your calendar for class; please let us know if you are unable to see it. We will be sending you class reminders as well.</li>
            <li><strong>Feedback:</strong>Class time includes a 10-minute feedback session. We kindly request ${formattedNames} to stay back, and share their class experience with us.</li>
            <li><strong>Class Withdrawals:</strong> We understand that plans might change - In case you would like to withdraw your child's enrolment from any class, please email us at support@coralacademy.com or send a text message to (872)-222-8643.</li>
            <li><strong>Code of Conduct:</strong> Classes are recorded for student safety. The recorded classes are for internal use only and are strictly confidential. These would not be disclosed or shared without parental consent. PFA the <a href="https://docs.google.com/document/d/1kU49ck4nGge6_k4Myua_eUpBx06MADlFxm_xRdUz7Os/edit" target="_blank">Code of Conduct Policy</a> for your reference.</li>
            </ul>
            
            <p>Happy Learning! </p>

            <p>Best,</p>
            <p>Coral Academy</p>
            <img src="${trackingPixelUrl}" width="1" height="1">
          </div>
        </body>
        </html>
        `;
      }else{
        trackingPixelUrl = `${serviceBaseUrl}/track.gif?recipientEmail=${encodeURIComponent(additionalInfo.email)}&classID=${encodeURIComponent(classid)}&emailSentAt=${formattedTimestamp}&parentName=${encodeURIComponent(parentName)}&childName=${encodeURIComponent(kidName)}&className=${encodeURIComponent(className)}&classTiming=${encodeURIComponent(classTimingIST)}&type=PARENT_REMINDER_BEFORE_CLASS`;
        emailSubject=`${formattedNames}'s class in 15 minutes : ${className}`;

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
            padding: 2px;
            margin: 0 auto;
            width: 100%;
          }
      
          h1 {
            color: #333;
            font-size: 24px;
          }
      
          p {
            color: black;
            font-size: 16px;
            line-height: 1.6;
          }
          li {
            color: black;
            font-size: 16px;
            line-height: 1.6;
          }
      
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hello ${parentName}</p>
          <p>Just a quick reminder that ${formattedNames}'s class is starting in 15 minutes.</p>

          <p><strong>Class Name:</strong> ${className}</p>
          <p><strong>Date & Time:</strong> ${classTiming}</p>
          <p><strong>Zoom Meeting Details:</strong></p>
            <ul>
              <li><a href="${zoomMeetingLink}" target="_blank">Zoom Link</a></li>
              <li>Meeting ID: ${meetingId}</li>
              <li>Passcode: ${passcode}</li>
            </ul>
          `
          emailContent+=`<p>We value your feedback! If you've taken classes with us previously, please <a href="https://tinyurl.com/mwtydca7">review us on Trustpilot.</a></p>`;
          emailContent+=`<ul>`;

          if (subClassDTO && subClassDTO.prerequisite !== undefined && subClassDTO.prerequisite !== '' && subClassDTO.prerequisite.toLowerCase() !== 'there are no prerequisites needed for the class.') {
            emailContent += `<li><strong>Prerequisite</strong>: ${subClassDTO.prerequisite}</li>`;
          }
            
          if (subClassDTO.prerequisite !== undefined && subClassDTO.prerequisite !== '' && subClassDTO.classMaterial !== undefined && subClassDTO.classMaterial !== '') {
            emailContent += '\n';
          }
            
          if (subClassDTO && subClassDTO.classMaterial !== undefined && subClassDTO.classMaterial !== '') {
            emailContent += `<li><strong>Class Materials</strong>: ${subClassDTO.classMaterial}</li>`;
          }

          emailContent+=`
          <p><strong>Important Information:</strong></p>

          <li><strong>Identity Verification:</strong> Ensuring learner safety as our highest priority, we request you to switch on ${formattedNames}'s camera at the start of each class for a quick identity check. While ${formattedNames} can choose to keep it off afterward, we suggest keeping it on for a more interactive learning experience.</li>
          <li><strong>Class Entry:</strong> We request learners to join class on time to ensure an uninterrupted learning experience. <strong>Late entries may be restricted after the initial 10 minutes, to maintain the flow of class.</strong></li>
          <li><strong>Class Alerts:</strong> We have blocked your calendar for class; please let us know if you are unable to see it. We will be sending you class reminders as well. </li>
          <li><strong>Feedback:</strong>Class time includes a 10-minute feedback session. We kindly request ${formattedNames} to stay back, and share their class experience with us.</li>
          <li><strong>Class Withdrawals:</strong> We understand that plans might change - In case you would like to withdraw your child's enrolment from any class, please email us at support@coralacademy.com or send a text message to (872)-222-8643.</li>
          <li><strong>Code of Conduct:</strong> Classes are recorded for student safety. The recorded classes are for internal use only and are strictly confidential. These would not be disclosed or shared without parental consent. PFA the <a href="https://docs.google.com/document/d/1kU49ck4nGge6_k4Myua_eUpBx06MADlFxm_xRdUz7Os/edit" target="_blank">Code of Conduct Policy</a> for your reference.</li>
          </ul>


          <p>Happy Learning! </p>

          <p>Best,</p>
          <p>Coral Academy</p>
          <img src="${trackingPixelUrl}" width="1" height="1">
        </div>
      </body>
      </html>
      `;

      }
      
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:additionalInfo.email, // Sender's email address'
        cc: 'anisha@coralacademy.com',
        subject: emailSubject,
        html:emailContent,
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email reminder to parent for ID::', reminderId);
          updateReminderStatus(reminderId, 'FAILURE', 'Error sending email: ' + error.message);
          const reportData = { channel: 'EMAIL', type: reportType, status: 'FAILURE', reason: error.message, parentEmail: additionalInfo.email, classId:additionalInfo.classId, reminderId:reminderId, childName:additionalInfo.kidName};
          insertSystemReport(reportData);
        } else {
          console.log('Reminder Email sent to parent for ID:', reminderId);
          updateReminderStatus(reminderId, 'SUCCESS', 'Email sent successfully');
          const reportData = { channel: 'EMAIL', type: reportType, status: 'SUCCESS', parentEmail: additionalInfo.email, classId:additionalInfo.classId, reminderId:reminderId, childName:additionalInfo.kidName};
          insertSystemReport(reportData);
        }
      });
    }catch(err) {
      console.error('Error sending email reminder to parent for ID::', reminderId);
      updateReminderStatus(reminderId, 'FAILURE', 'Unexpected Error sending email: ' + err.message);
      const reportData = { channel: 'EMAIL', type: reportType, status: 'FAILURE', reason: err.message, parentEmail: additionalInfo.email, classId:additionalInfo.classId, childName:additionalInfo.kidName, reminderId:reminderId};
      insertSystemReport(reportData);
    }

  };

const updateReminderStatus = async (reminderId, statusToUpdate, responseBody) => {
  
    const updateClient = new Client({
        connectionString: connectionString,
    });
    try {
      await updateClient.connect();

      const result = await updateClient.query(
          'UPDATE reminders SET reminder_status = $1, response_body = $2 WHERE id = $3',
          [statusToUpdate, responseBody, reminderId]
      );


      console.log('Email Reminder status updated successfully for ID:', reminderId);
  } catch (err) {
      console.error('Error updating email reminder status:', err);
  } finally {
      updateClient.end();
}
};

  
  module.exports = parentReminderEmail;