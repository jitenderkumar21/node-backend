const express = require('express');
const app = express();
const port = 3000;
const csvWriter = require('csv-writer');
const cors = require('cors');
const sendEmail = require('./emailSender');
const sendEmailToUs = require('./emailSenderUs');
const googleSheets = require('./googleSheet'); // Import the module
const {classesInfo,cachedClassesInfo} = require('./classesInfo'); // Import the module
const maxLearners = require('./maxLearners'); // Import the module
const defaultTimeZone = require('./defaultTimeSlot'); // Import the module
const calendarInvite = require('./calender'); // Import the module
const teacherCalendarInvite = require('./teacherCalendar'); // Import the module
const saveEnrollment = require('./sheets/saveEnrollments'); // Import the module
const getBlockedEmails = require('./sheets/blockedEmails');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const momentTime = require('moment');
const sendEmailToTeacher = require('./emails/teacherEmail');
const whatsappReminderCron = require('./crons/whatsappReminderCron');
const teacherEmailReminderCron = require('./crons/teacherEmailReminderCron');
const createWhatsappReminders = require('./createWhatsappReminders');
const getIpInfo = require('./location/IPInfo'); // Import the module
const saveEnrollments = require('./sheets/saveEnrollments');
const saveEmailTrackingEvent = require('./sheets/saveEmailTrackingEvent');
const classIdTimingMap = require('./sheets/classIdTimingMap');
const {  getAllSystemReports } = require('./dao/systemReportDao')
const getSubClassesInfo = require('./sheets/getSubClassesInfo');
const bodyParser = require('body-parser');
const {
  updateCounts,
  getAllClassCounts
} = require('./dao/classesDao');

const {
  insertParentInfo,
  getParentInfoByEmail,
} = require('./dao/parentsInfoDao')

const {getEnrollmentsByClassId} = require('./dao/enrollmentsDao');

const unenroll = require('./service/unenrollService');


app.use(express.json());

// Use the CORS middleware
app.use(cors());
app.set('trust proxy', true); // Enable trusting of the X-Forwarded-For header

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});
// const multer = require('multer');
// const upload = multer();
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});


app.post('/test', async (req, res) => {
  let info = ['Test Class','Jeetu','jitender.kumar@iitgn.ac.in',"2023-12-20 15:00","2023-12-20 16:00",undefined];
  let classDisplayName = "Class on Sunday";
  // const ipAddress = req.ip || req.connection.remoteAddress;
  // saveEnrollments(req.body,'152.59.194.85');
  // createWhatsappReminders(req.body,req.query.timezone);
  // const result = await getParentInfoByEmail('jitender.kumar@iitgn.ac.in');
  await unenroll(req.body);
  res.send('DONE');
});
// Middleware to parse JSON and urlencoded form data
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.post('/test3', (req, res) => {
  // Extract form data from request body
  const formData = req.body;

  // Log form data
  console.log('Received form data:');
  console.log(formData);

  // Respond with a success message
  res.status(200).json({ message: 'Form data received successfully!' });
});
// https://coral-staging.onrender.com

app.get('/test2', async (req, res) => {
  const nodemailer = require('nodemailer');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider
  auth: {
    user: 'support@coralacademy.com',
    pass: 'xcvf sxnm yctg jvte',
  },
});

// Define the AMP HTML content of your email
const ampHtmlContent = `
<!DOCTYPE html>
<html ⚡4email>
<head>
    <meta charset="utf-8">
    <style amp4email-boilerplate>
        body { visibility: hidden; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; font-size: 16px; color: #000000; }
        .class-selection { margin-bottom: 20px; }
        .class-selection legend { font-weight: bold; }
        .timeslot-label { display: block; margin-bottom: 10px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; cursor: pointer; }
    </style>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script>
        function submitForm() {
            var formData = {
                class1_timeslot: [],
                class2_timeslot: [],
                class3_timeslot: []
            };

            document.querySelectorAll('input[name="class1_timeslot[]"]:checked').forEach(item => formData.class1_timeslot.push(item.value));
            document.querySelectorAll('input[name="class2_timeslot[]"]:checked').forEach(item => formData.class2_timeslot.push(item.value));
            document.querySelectorAll('input[name="class3_timeslot[]"]:checked').forEach(item => formData.class3_timeslot.push(item.value));

            fetch('https://coral-staging.onrender.com/test3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) {
                    alert('Form submitted successfully!');
                } else {
                    alert('Failed to submit form. Please try again.');
                }
            })
            .catch(error => {
                alert('An error occurred while submitting the form.');
                console.error('Error:', error);
            });
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>Class Selection</h1>
        <div class="class-selection">
            <fieldset>
                <legend>Class 1</legend>
                <label class="timeslot-label">
                    <input type="checkbox" name="class1_timeslot[]" value="morning">
                    Morning
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class1_timeslot[]" value="afternoon">
                    Afternoon
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class1_timeslot[]" value="evening">
                    Evening
                </label>
            </fieldset>
        </div>

        <div class="class-selection">
            <fieldset>
                <legend>Class 2</legend>
                <label class="timeslot-label">
                    <input type="checkbox" name="class2_timeslot[]" value="morning">
                    Morning
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class2_timeslot[]" value="afternoon">
                    Afternoon
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class2_timeslot[]" value="evening">
                    Evening
                </label>
            </fieldset>
        </div>

        <div class="class-selection">
            <fieldset>
                <legend>Class 3</legend>
                <label class="timeslot-label">
                    <input type="checkbox" name="class3_timeslot[]" value="morning">
                    Morning
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class3_timeslot[]" value="afternoon">
                    Afternoon
                </label>
                <label class="timeslot-label">
                    <input type="checkbox" name="class3_timeslot[]" value="evening">
                    Evening
                </label>
            </fieldset>
        </div>

        <div class="button-container">
            <button class="button" onclick="submitForm()">Submit</button>
        </div>
    </div>
</body>
</html>
`;

// Define the mail options
const mailOptions = {
  from: 'support@coralacademy.com', // Sender's email address
    to: 'jitender.kumar@iitgn.ac.in',
    subject: 'Your Subject',
    html: ampHtmlContent
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('Error occurred:', error.message);
        return;
    }
    console.log('Email sent successfully!');
});


  res.send('Email Sent');
});

app.post('/teacher/invite', async (req, res) => {
  const array =  [
    'Historic Clashes: 5 Game Changing Battles',
    'Clark Vandeventer',
    '',
    '2024-02-01 22:00',
    '2024-02-01 23:00',
    undefined,
    '1 February, Thursday, 2:00 PM - 3:00 PM (PST)'
  ]
  sendEmailToTeacher(array);
  res.send('Sent teacher Email');
});


// app.get('/', (req, res) => {
//   const ipAddress = req.ip || req.connection.remoteAddress;

//   // Assuming getIpInfo is an asynchronous function
//   getIpInfo(ipAddress).then(ipInfo => {
//     console.log('IP Information:', ipInfo);
//     res.send('User IP Address: ' + ipAddress);
//   }).catch(error => {
//     console.error('Error fetching IP information:', error.message);
//     res.status(500).send('Internal Server Error');
//   });
// });

app.get('/info', async (req, res) => {
  const userTimeZone = req.query.timezone;
  const classes = await cachedClassesInfo(req.query.timezone);
  res.json(classes);
});

app.get('/cms/report', async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const filters = { classId: req.query.classId, status: req.query.status, channel: req.query.channel, type: req.query.type }
  const systemReport = await getAllSystemReports(filters,pageNumber);
  res.json(systemReport);
});

app.get('/cms/enrollments', async (req, res) => {
  const filters = { classId: req.query.classId}
  const pageNumber = req.query.pageNumber;
  const systemReport = await getEnrollmentsByClassId(filters,pageNumber);
  res.json(systemReport);
});

app.post('/cms/unenroll', async (req, res) => {
  await unenroll(req.body);
  res.json('Students unrenrolled');
});

app.get('/parent/info', async (req, res) => {
  const email = req.query.email;
  const result = await getParentInfoByEmail(email);
  res.json(result);
});

app.get('/track.gif', async (req, res) => {
  const recipientEmail = req.query.recipientEmail;
  const classID = req.query.classID;
  const timestamp = req.query.timestamp;
  const parentName = req.query.parentName;
  const childName = req.query.childName;
  const type = req.query.type;

  // Write data to Google Sheets
  saveEmailTrackingEvent([type, classID, recipientEmail, parentName, childName, timestamp]);

  // Set cache-control headers to prevent caching
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  // Set content type to image/gif
  res.set('Content-Type', 'image/gif');

  // Return a transparent 1x1 pixel GIF response
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});



app.post('/save', async (req, res) => {
  const userTimeZone = req.query.timezone;
  let blockedEmails = await getBlockedEmails(req.body);
  const emailToCheck = req.body.email;

  if (blockedEmails.has(emailToCheck)) {
    console.log("Blocking user for email :",emailToCheck);
    res.status(200).json({ message: 'Registration Successful' });
    return;
  }

  // const defaultTimeZoneMap =  await defaultTimeZone();

//   // Create a connection pool
//   const { Pool } = require('pg');
//   const pool = new Pool({
//     connectionString: 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true',
//   });

//   // Acquire a connection from the pool
//   pool.connect((connectionError, client) => {
//   if (connectionError) {
//     console.error('Error acquiring a connection:', connectionError);
//     return;
//   }

//   // Use the client (connection) for database operations
//   const personDetails = req.body;
  
  
//     // SQL query to insert data into the "users" table
//     const insertQuery = `
//       INSERT INTO users (P_NAME, C_NAME,EMAIL,AGE,T1,T2,T3)
//       VALUES ($1,$2, $3,$4,$5, $6,$7)
//     `;
  
//     const values = [personDetails.parentName, personDetails.childName,personDetails.email, personDetails.childAge,personDetails.classDetails[0].timeslot,personDetails.classDetails[1].timeslot,personDetails.classDetails[2].timeslot];
  
//     // Execute the query to insert data
//     client.query(insertQuery, values, (queryErr) => {
//       if (queryErr) {
//         console.error('Error inserting data:', queryErr);
//         res.status(500).json({ error: 'Error inserting data' });
//         return;
//       } else {
//         console.log('Data inserted successfully');        
//       }
    
//   });
  
// //   client.release(true);

// });
// pool.end();
// const pool1 = new Pool({
//   connectionString: 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true',
// });
// pool1.connect((connectionError, client) => {
//     if (connectionError) {
//       console.error('Error acquiring a connection:', connectionError);
//       return;
//     }
  
//     // Use the client (connection) for database operations
//     const personDetails = req.body;
//   const updateQuery = `
//       UPDATE CLASSES SET count = count + 1 WHERE class_id = $1 AND slot = $2
//       RETURNING count;  -- Return the updated count or 0 if no rows were updated
//     `;
    
//     const insertClassesQuery = `
//       INSERT INTO CLASSES (class_id, slot, count)
//       VALUES ($1, $2, 1)
//       RETURNING count;  -- Return 1 as count for a new row
//     `;
    
//     const classDetails = personDetails.classDetails;
    
//     classDetails.forEach((classDetail) => {
//       const { classid } = classDetail;
//       let timeslot = classDetail.timeslot;
//       if (timeslot){
//         const prefix = "want another slot";
//         if(!(timeslot.toLowerCase().startsWith(prefix))){
//           timeslot = defaultTimeZoneMap[classid];
//         }
//       // Try to update the count, and if no rows are updated, insert a new row
//       client.query(updateQuery, [classid, timeslot], (updateErr, updateResult) => {
//         if (updateErr) {
//           console.error('Error updating data:', updateErr);
//         } else if (updateResult.rowCount === 0) {
//           // No rows were updated, so insert a new row
//           client.query(insertClassesQuery, [classid, timeslot], (insertErr, insertResult) => {
//             if (insertErr) {
//               console.error('Error inserting data:', insertErr);
//             } else {
//               console.log('New row inserted with count: 1');
//             }
//           });
//         } else {
//           console.log(`Updated count: ${updateResult.rows[0].count}`);
//         }
//       });
//     }
//     });
    
//     // client.release(true);
   
//   });
//   pool1.end();

  const ipAddress = req.ip || req.connection.remoteAddress;
  updateCounts(req.body.classDetails);
  sendEmail(req.body,userTimeZone);
  sendEmailToUs(req.body,userTimeZone,ipAddress);
  // googleSheets(req.body);
  await teacherCalendarInvite(req.body);
  calendarInvite(req.body);
  createWhatsappReminders(req.body,req.query.timezone);
  
  saveEnrollment(req.body,ipAddress);
  insertParentInfo(req.body);
  res.status(200).json({ message: 'Registration Successful' });
  });



  app.get('/classes', async (req, res) => {

    const overAllMap = await maxLearners();
    const maxLearnersCount = overAllMap['classIdToValue'];
    // console.log('maxLearnersCount', maxLearnersCount);
    // const classIdToSlots = overAllMap['classIdToSlots'];
    const classCounts = await getAllClassCounts(req.body.classDetails);
    const finalJson = {};

    for (const classId in classCounts) {
      finalJson[classId] = [];

      for (const subClassId in classCounts[classId]) {
        const count = classCounts[classId][subClassId];
        const maxCap = maxLearnersCount[classId] || 15;

        if (count >= maxCap) {
          finalJson[classId].push(subClassId);
        }
      }
    }
    // console.log(finalJson);
    res.json(finalJson);
    

  });

  


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  // myCronJob.start();
  whatsappReminderCron.start();
  // teacherEmailReminderCron.start();
});
