const nodemailer = require('nodemailer');
const classIdTimingMap = require('./sheets/classIdTimingMap');
const ClassUtility = require('./utils/subClassUtility');
const getSubClassesInfo = require('./sheets/getSubClassesInfo');
const getIpInfo = require('./location/IPInfo'); // Import the module
const {  insertSystemReport } = require('./dao/systemReportDao')
require('dotenv').config();

const supportEmailPassword = process.env.SUPPORT_EMAIL_PASSWORD;

const sendEmailToUs = async (personDetails,userTimeZone,ipAddress) => {
  try{
    const classIdTimings = await classIdTimingMap();
    const subClassesInfo = await getSubClassesInfo();
    const ipInfo = await getIpInfo(ipAddress);
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: supportEmailPassword,
        },
      });

      const classDetails = personDetails.classDetails;
      let classIdArray = [];
      let waitlistClassesFlag = false;
      let confirmedClassesFlag = false;
      let confirm
      let classes = `
                <table class="class-table">
                    <tr>
                        <th>Class Name</th>
                        <th>Date and Time</th>
                        <th>Class Type</th>
                        <th>Teacher Name</th>
                    </tr>
            `;
      let waitlistClasses = `
        <table class="class-table">
            <tr>
                <th>Class Name</th>
                <th>Date and Time</th>
                <th>Class Type</th>
                <th>Teacher Name</th>
            </tr>
        `;
      classDetails.forEach((classDetail) => {
        let { classid, className, classTag, timeslots } = classDetail;
      
        // if (classTag.toLowerCase() === 'course') {
        //     classTag = 'Course';
        //     if (timeslots && timeslots.length > 0) {
        //         // Filter out timeslots where isPast is true
        //         const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);
    
        //         if (futureTimeslots.length > 0) {
        //             isCoursePresent = true;
        //             confirmedClassesFlag = true;
        //             classes += `
        //                     <tr>
        //                         <td>${className}</td>
        //                         <td>`;
    
        //             futureTimeslots.forEach((timeslot, index) => {
        //                 let { timing, subClassId } = timeslot;
        //                 const userStartDateTime =classIdTimings.get(subClassId)[0];  // Replace this with the user's input
        //                 const userEndDateTime = classIdTimings.get(subClassId)[1]; 
        //                 let classDisplayTiming = ClassUtility.getClassDisplayTiming(userTimeZone,userStartDateTime,userEndDateTime);
                        
        //                 classes += `${classDisplayTiming}${index < futureTimeslots.length - 1 ? '<br>' : ''}`;
        //             });
        //             let subClassInfo = subClassesInfo[classid+'_1'];
        //             classes += `</td>
        //                         <td>${classTag}</td>
        //                         <td>${subClassInfo.teacherName}</td>
        //                     </tr>
        //             `;
        //         }
        //     }
        // } else {
            // For other class types
          if (timeslots && timeslots.length > 0) {
              // Filter out timeslots where isPast is true
              const futureTimeslots = timeslots.filter((timeslot) => !timeslot.isPast);
  
              futureTimeslots.forEach((timeslot) => {
                  let { timing,subClassId, isWaitlist } = timeslot;
                  classIdArray.push(subClassId);
                  let subClassInfo = subClassesInfo[subClassId];
                  const userStartDateTime =classIdTimings.get(subClassId)[0];  // Replace this with the user's input
                  const userEndDateTime = classIdTimings.get(subClassId)[1]; 
                  let classDisplayTiming = ClassUtility.getClassDisplayTiming(userTimeZone,userStartDateTime,userEndDateTime);
                  const modifiedClassName = ClassUtility.getModifiedClassName(subClassId,className,classTag);
                  const modifiedClassTag = ClassUtility.getModifiedClassTag(classTag);
                  if(isWaitlist){
                    waitlistClassesFlag = true;
                    waitlistClasses += `
                            <tr>
                                <td>${modifiedClassName}</td>
                                <td>${classDisplayTiming}</td>
                                <td>${modifiedClassTag}</td>
                                <td>${subClassInfo.teacherName}</td>
                            </tr>
                    `;

                  }else{
                      confirmedClassesFlag = true;
                      classes += `
                              <tr>
                                  <td>${modifiedClassName}</td>
                                  <td>${classDisplayTiming}</td>
                                  <td>${modifiedClassTag}</td>
                                  <td>${subClassInfo.teacherName}</td>
                              </tr>
                      `;
                  }
              });
          }
    });

      classes+=`</table>`;
      waitlistClasses+=`</table>`;



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
            padding: 20px;
            margin: 0 auto;
            width: 80%;
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
      
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hi</p>
          <p>There is a new sign up!</p>
          <ul>
            <li><strong>Parent's Name:</strong> ${personDetails.parentName}</li>
            <li><strong>Parent's Email:</strong> ${personDetails.email}</li>
            <li><strong>Learner's Name :</strong> ${personDetails.childName}</li>
            <li><strong>Learner's Age :</strong> ${personDetails.childAge}</li>
            <li><strong>Phone Number :</strong> ${personDetails.phoneNumber}</li>
            <li><strong>Communication Preference :</strong> ${personDetails.commPref.join(',')}</li>
            <li><strong>How did you get to know about us ? :</strong> ${personDetails.knowabout}</li>
            <li><strong>Which Facebook group referred you to us ?/Could you please specify source ? : </strong> ${personDetails.additionalInfo}</li>
            <li><strong>Drop us your questions or comments! :</strong> ${personDetails.comments}</li>
            <li><strong>Parent Country & City :</strong>${ipInfo.country} - ${ipInfo.city}</li>

            <p><strong>Enrolled classes below: </strong></p>
            <p>${classes}</p>

            <p>Waitlisted classes below :</p>
            <p>${waitlistClasses}</p>

          </ul>
          <p>Thank you!</p>
        
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:'support@coralacademy.com',
        subject: 'New Registration For Demo',
        html:emailContent,
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending confirmation email to us:', error);
          const reportData = { channel: 'EMAIL', type: 'Coral Confimation', status: 'FAILURE', reason: error.message, parentEmail: personDetails.email, childName: personDetails.childName, classId:classIdArray};
          insertSystemReport(reportData);
        } else {
          console.log('Confirmation Email sent to us for parent:', personDetails.email);
          const reportData = { channel: 'EMAIL', type: 'Coral Confimation', status: 'SUCCESS', parentEmail: personDetails.email, childName: personDetails.childName, classId:classIdArray};
          insertSystemReport(reportData);
        }
      });

  }catch (error) {
    console.error('Error sending confirmation email to us');
    const reportData = { channel: 'EMAIL', type: 'Coral Confimation', status: 'FAILURE', reason: 'Internal Server Error', parentEmail: personDetails.email, childName: personDetails.childName};
    insertSystemReport(reportData);
  }

  };
  
  module.exports = sendEmailToUs;