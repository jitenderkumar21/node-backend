const express = require('express');
const app = express();
const port = 3000;
const csvWriter = require('csv-writer');
const cors = require('cors');
const sendEmail = require('./emailSender');
const sendEmailToUs = require('./emailSenderUs');
const googleSheets = require('./googleSheet'); // Import the module
const classesInfo = require('./classesInfo'); // Import the module
const maxLearners = require('./maxLearners'); // Import the module
const defaultTimeZone = require('./defaultTimeSlot'); // Import the module
const calendarInvite = require('./calender'); // Import the module
const teacherCalendarInvite = require('./teacherCalendar'); // Import the module
const classCancelltionInfo = require('./sheets/classCancellationInfo'); // Import the module
const saveEnrollment = require('./sheets/saveEnrollments'); // Import the module
const getBlockedEmails = require('./sheets/blockedEmails');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const momentTime = require('moment');
const sendEmailToTeacher = require('./emails/teacherEmail');
const whatsappReminderCron = require('./crons/whatsappReminderCron');
const createWhatsappReminders = require('./createWhatsappReminders');
const getIpInfo = require('./location/IPInfo'); // Import the module
const saveEnrollments = require('./sheets/saveEnrollments');
const classIdTimingMap = require('./sheets/classIdTimingMap');
const updateCounts = require('./dao/classesDao');
// classIdTimingMap


app.use(express.json());

// Use the CORS middleware
app.use(cors());
app.set('trust proxy', true); // Enable trusting of the X-Forwarded-For header

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});


app.post('/test', async (req, res) => {
  let info = ['Test Class','Jeetu','jitender.kumar@iitgn.ac.in',"2023-12-20 15:00","2023-12-20 16:00",undefined];
  let classDisplayName = "Class on Sunday";
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userTimeZone = req.query.timezone;
  updateCounts(req.body.classDetails);
  // saveEnrollments(req.body,'152.59.194.85');
  // classIdTimingMap();
  // sendEmail(req.body,userTimeZone);

  res.send('User IP Address: ' + ipAddress);
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
  const classes = await classesInfo(userTimeZone);
  res.json(classes);
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
  sendEmail(req.body,userTimeZone);
  // sendEmailToUs(req.body);
  // googleSheets(req.body);
  await teacherCalendarInvite(req.body);
  calendarInvite(req.body);
  // createWhatsappReminders(req.body,req.query.timezone);
  const ipAddress = req.ip || req.connection.remoteAddress;
  saveEnrollment(req.body,ipAddress);
  res.status(200).json({ message: 'Registration Successful' });
  });



  app.get('/classes', async (req, res) => {

    const overAllMap = await maxLearners();
    const maxLearnersCount = overAllMap['classIdToValue'];
    const classIdToSlots = overAllMap['classIdToSlots'];

    // Query to fetch data from the "classes" table
    const query = 'SELECT class_id, slot, count FROM classes';
  const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true',
});

    pool.query(query, (error, result) => {
      if (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      } else {
        // Process the result and format it as needed
        const classes = {};
        result.rows.forEach((row) => {
          const { class_id, slot, count } = row;
          
          var isFull = false;
          const prefix = "want another slot";
          if(count >=maxLearnersCount[class_id] && !(slot.toLowerCase().startsWith(prefix))){
            isFull = true;
          }

          if (!classes[class_id]) {
            classes[class_id] = {

                class_id,
              slots: [],
            };
          }
          if(isFull==true){
              var totalClassSlots = classIdToSlots[class_id];
              for (var i = 0; i < totalClassSlots.length; i++) {
                classes[class_id].slots.push({
                  slot:totalClassSlots[i],
                  isFull,
                });
              }
          }
          
        });
  
        // Convert classes object to an array
        const response = Object.values(classes);
  
        res.json(response);
      }
    });
    pool.end();
  });


  // const cron = require('node-cron');

  // Define your task to be executed every minute
  // const myCronJob = cron.schedule('* * * * *', async () => {
  //   try {
  //     const currentTime = new Date();
  //     console.log(`Cron job is running every minute at ${currentTime}`);
  
  //     const cancellationInfo = await classCancelltionInfo();
  //     for (const [id, info] of Object.entries(cancellationInfo)) {
  //       console.log(`ID: ${id}, Array:`, info);
  //       if(info[1]!=undefined && info[2]==undefined) {
  //         let classTime = moment(info[1], 'YYYY-MM-DD HH:mm').subtract(48,'hours');
  //         let classStartTimeIST = moment(info[1], 'YYYY-MM-DD HH:mm');
  //         if(classStartTimeIST.isValid() && classStartTimeIST.isAfter(currentTime)) {
  //           if(classTime.isValid() && classTime.isBefore(currentTime)) {
  //             console.log('Cancelling class for id:', id);

  //             }

  //         }

  //       }
  //     }
      
  //   } catch (error) {
  //     console.error('Error in cron job:', error);
  //   }
  // });
  
  // Start the cron job
  


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  // myCronJob.start();
  // whatsappReminderCron.start();
});
