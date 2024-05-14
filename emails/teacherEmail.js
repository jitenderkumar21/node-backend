const ClassUtility = require('../utils/subClassUtility');

const nodemailer = require('nodemailer');
const path = require('path');
const {  insertSystemReport } = require('../dao/systemReportDao')
require('dotenv').config();

const supportEmailPassword = process.env.SUPPORT_EMAIL_PASSWORD;


const sendEmailToTeacher = (teacherName,teacherEmail,classes,text,modifiedClassName,classIdArray) => {

    const ATTACHMENT_PATH = path.join(process.cwd(), 'assets/Coral Academy Background.png');
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: supportEmailPassword,
        },
      });


      const emailContent = `
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
          .class-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
    
        .class-table th, .class-table td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
    
        .class-table th {
            background-color: #99e1ea;
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
          .custom-para {
            color: #666;
            font-size: 12px;
            line-height: 1.0;
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
          <p>Hi ${teacherName},</p>
          <p>Hope you are doing well!</p>
          <p>Excited to inform you that the following ${text} been successfully scheduled:</p>
          ${classes}
  
          <p>We have blocked your calendar for class; please let us know if you are unable to see it. The  enrollments will be sent to you atleast 6 hours before class, however, they might vary due to last minute enrollments.</p>
          
          <p><strong>Things to note :</strong></p>

          <p><strong><u>Before Class</u></strong></p>
          <ul>
              <li><strong>Class Prerequisites:</strong> We request you to email us the class prerequisites & materials (if any) at the earliest, so that we can send those to parents well in advance.</li>
              <li><strong>Student Homework & Uploads:</strong> Please inform us if your class requires completion of any student homework, so that we can request parents to upload the same.</li>
              <li><strong>Class Entry:</strong> Feel free to inform our team if you'd like us to restrict admitting students who join the class, after the 10-minute mark.</li>
              <li><strong>Zoom Background:</strong> We request you to use the attached Coral Academy background on Zoom during class.</li>
              <li><strong>Code of conduct:</strong> Classes are recorded for student safety. The recorded classes are for internal use only and are strictly confidential. These would not be disclosed or shared without your consent. </li>
          </ul>

          <p><strong><u>During Class</u></strong></p>
          <ul>
            <li><strong>Learner Verification:</strong> For learner safety, we request you to verify learners through a quick live video check-in at the beginning of each class, to visually confirm that the learner in question is a child. The learner can then turn off video after their check-in. If you’ve never seen the learner on video before, and they’re unable or unwilling to enable their video, please remove them from the class.</li>
            <li><strong>Post Class Interaction:</strong> Kindly inform students to stay back after you exit the class - We will be spending 10 minutes with the students to understand their topic preferences and get class feedback.</li>
            <li><strong>Support:</strong> A team member will join your class as a co-host, helping you navigate the waiting room and resolve any technical glitches.</li>
          </ul>

          <p><strong><u>After Class</u></strong></p>
          <ul>
            <li><strong>Payments:</strong> Payments for the class will be processed weekly, every Saturday, post class.</li>
            <li><strong>Feedback:</strong> Your feedback is valuable to us! Please feel free to share your thoughts on how we can improve and make your experience even better.</li>
          </ul>

          <p>PFA our <a href="https://docs.google.com/document/d/1lIqvqEB6Z7ic84JWlPAqKlILxlOsTixYPPlIHVfLToI/edit?usp=sharing" target="_blank">Code of Conduct Policy</a> for your reference.</p>

          <p>Please feel free to email us or text/call at (872)-222-8643 for any assistance required.</p>

          <p>Looking forward to class!</p>
          
          <p>Best,</p>
          <p>Coral Academy</p>
        
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:teacherEmail.split(',')[0],
        cc: 'anisha@coralacademy.com',
        subject: `Coral Academy: Class Confirmed - ${modifiedClassName}`,
        html:emailContent,
        attachments: [
            {
                filename: 'coral_academy_background.png',
                path: ATTACHMENT_PATH,
                cid: 'unique@coralacademy.com' // Optional content ID for embedding in the email
            }
        ],
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          const reportData = { channel: 'EMAIL', type: 'Teacher Confimation', status: 'FAILURE', reason: error.message, classId:classIdArray};
          insertSystemReport(reportData);
          console.error('Error sending email to teacher:', error);
        } else {
          const reportData = { channel: 'EMAIL', type: 'Teacher Confimation', status: 'SUCCESS', classId:classIdArray};
          insertSystemReport(reportData);
          console.log('Confirmation Email sent to teacher:', subClassDTO.teacherEmail.split(',')[0]);
        }
      });

  };

function createTableAndSendEmail(timeslot,classTag,className,subClassDTO,classIdTimings){
  const teacherEmail = subClassDTO.teacherEmail;
  const teacherName = subClassDTO.teacherName;
  let classes = `
              <table class="class-table">
                  <tr>
                      <th>Class Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Zoom Details</th>
                  </tr>
          `;

  const { timing, subClassId } = timeslot;
  const classNumber = subClassId.split('_')[1]; // Assuming subClassId format is "33_1"
  let classNameWithNumber = className;
  // Append class number to the className
  if(classTag.toLowerCase() === 'ongoing' || classTag.toLowerCase() === 'playlist-2'){
      classNameWithNumber = `${className} Class ${classNumber}`;
  }
  const classIdTimingMap = classIdTimings.get(subClassId);
  const dateMonthAndDay = ClassUtility.getdateMonthAndDay(classIdTimingMap[0]);
  const estTiming = ClassUtility.getESTTiming(classIdTimingMap[0],classIdTimingMap[1]);
  const cstTiming = ClassUtility.getCSTTiming(classIdTimingMap[0],classIdTimingMap[1]);
  const pstTiming = ClassUtility.getPSTTiming(classIdTimingMap[0],classIdTimingMap[1]);
  classes += `
              <tr>
                  <td>${classNameWithNumber}</td>
                  <td>${dateMonthAndDay}</td>
                  <td>`;
          classes += `${estTiming}<br>`; 
          classes += `${cstTiming}<br>`;
          classes += `${pstTiming}`; 
          classes+= `</td>
                  <td>
                    <p class="custom-para"><a href=${subClassDTO.zoomMeetingLink}>Zoom Link</a></p>
                    <p class="custom-para">Meeting ID: ${subClassDTO.meetingId}</p>
                    <p class="custom-para">Passcode: ${subClassDTO.passcode}</p>
                  </td>
          </tr>`;
  classes += `</table>`;
  // console.log('Created classes: ', classes);
  sendEmailToTeacher(teacherName,teacherEmail,classes,'class has',classNameWithNumber,[subClassId]);
}

function createTableForCoursesAndSendEmail(timeslots,className,subClassesInfo,classIdTimings){
  let classes = `
              <table class="class-table">
                  <tr>
                      <th>Class Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Zoom Details</th>
                  </tr>
          `;
  let classIdArray = [];

  if (timeslots && timeslots.length > 0) {
      // Filter out timeslots where isPast is true
      const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);
      let teacherEmail = '';
      let teacherName = '';
      futureTimeslots.forEach((timeslot) => {
          const { timing, subClassId } = timeslot;
          classIdArray.push(subClassId);
          let subClassDTO = subClassesInfo[subClassId];
          teacherEmail = subClassDTO.teacherEmail;
          teacherName = subClassDTO.teacherName;
          const classNumber = subClassId.split('_')[1]; // Assuming subClassId format is "33_1"

          // Append class number to the className
          const classNameWithNumber = `${className} Class ${classNumber}`;
          const classIdTimingMap = classIdTimings.get(subClassId);
          const dateMonthAndDay = ClassUtility.getdateMonthAndDay(classIdTimingMap[0]);
          const estTiming = ClassUtility.getESTTiming(classIdTimingMap[0],classIdTimingMap[1]);
          const cstTiming = ClassUtility.getCSTTiming(classIdTimingMap[0],classIdTimingMap[1]);
          const pstTiming = ClassUtility.getPSTTiming(classIdTimingMap[0],classIdTimingMap[1]);
          classes += `
              <tr>
                  <td>${classNameWithNumber}</td>
                  <td>${dateMonthAndDay}</td>
                  <td>`;
          classes += `${estTiming}<br>`; 
          classes += `${cstTiming}<br>`;
          classes += `${pstTiming}`; 
          classes+= `</td>
                  <td>
                    <p class="custom-para"><a href=${subClassDTO.zoomMeetingLink}>Zoom Link</a></p>
                    <p class="custom-para">Meeting ID: ${subClassDTO.meetingId}</p>
                    <p class="custom-para">Passcode: ${subClassDTO.passcode}</p>
                  </td>
          </tr>`;
      });
      classes += `</table>`;
    // console.log('Created classes: ', classes);
      sendEmailToTeacher(teacherName,teacherEmail,classes,'classes have',className,classIdArray);
  }
}


  
  module.exports = {
    sendEmailToTeacher,
    createTableAndSendEmail,
    createTableForCoursesAndSendEmail,
  };