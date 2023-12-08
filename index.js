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
const inviteInfo = require('./inviteInfo'); // Import the module
const { google } = require('googleapis');
const moment = require('moment-timezone');
const momentTime = require('moment');


app.use(express.json());

// Use the CORS middleware
app.use(cors());

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Additional error handling logic can be added here, such as logging or responding to the error.
});


app.post('/test', (req, res) => {
  sendEmail(req.body);
  res.send('email sent');
});

app.get('/info', async (req, res) => {
  const userTimeZone = req.query.timezone;
  console.log(userTimeZone);
  const classes = await classesInfo(userTimeZone);
  res.json(classes);
});



app.post('/save', async (req, res) => {

  const defaultTimeZoneMap =  await defaultTimeZone();

  // Create a connection pool
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true',
  });

  // Acquire a connection from the pool
  pool.connect((connectionError, client) => {
  if (connectionError) {
    console.error('Error acquiring a connection:', connectionError);
    return;
  }

  // Use the client (connection) for database operations
  const personDetails = req.body;
  
  
    // SQL query to insert data into the "users" table
    const insertQuery = `
      INSERT INTO users (P_NAME, C_NAME,EMAIL,AGE,T1,T2,T3)
      VALUES ($1,$2, $3,$4,$5, $6,$7)
    `;
  
    const values = [personDetails.parentName, personDetails.childName,personDetails.email, personDetails.childAge,personDetails.classDetails[0].timeslot,personDetails.classDetails[1].timeslot,personDetails.classDetails[2].timeslot];
  
    // Execute the query to insert data
    client.query(insertQuery, values, (queryErr) => {
      if (queryErr) {
        console.error('Error inserting data:', queryErr);
        res.status(500).json({ error: 'Error inserting data' });
        return;
      } else {
        console.log('Data inserted successfully');        
      }
    
  });
  
//   client.release(true);

});
pool.end();
const pool1 = new Pool({
  connectionString: 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true',
});
pool1.connect((connectionError, client) => {
    if (connectionError) {
      console.error('Error acquiring a connection:', connectionError);
      return;
    }
  
    // Use the client (connection) for database operations
    const personDetails = req.body;
  const updateQuery = `
      UPDATE CLASSES SET count = count + 1 WHERE class_id = $1 AND slot = $2
      RETURNING count;  -- Return the updated count or 0 if no rows were updated
    `;
    
    const insertClassesQuery = `
      INSERT INTO CLASSES (class_id, slot, count)
      VALUES ($1, $2, 1)
      RETURNING count;  -- Return 1 as count for a new row
    `;
    
    const classDetails = personDetails.classDetails;
    
    classDetails.forEach((classDetail) => {
      const { classid } = classDetail;
      let timeslot = classDetail.timeslot;
      if (timeslot){
        const prefix = "want another slot";
        if(!(timeslot.toLowerCase().startsWith(prefix))){
          timeslot = defaultTimeZoneMap[classid];
        }
      // Try to update the count, and if no rows are updated, insert a new row
      client.query(updateQuery, [classid, timeslot], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating data:', updateErr);
        } else if (updateResult.rowCount === 0) {
          // No rows were updated, so insert a new row
          client.query(insertClassesQuery, [classid, timeslot], (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Error inserting data:', insertErr);
            } else {
              console.log('New row inserted with count: 1');
            }
          });
        } else {
          console.log(`Updated count: ${updateResult.rows[0].count}`);
        }
      });
    }
    });
    
    // client.release(true);
   
  });
  pool1.end();
  sendEmail(req.body);
  sendEmailToUs(req.body);
  googleSheets(req.body);
  calendarInvite(req.body);
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
        console.info(result);
        const classes = {};
        result.rows.forEach((row) => {
          const { class_id, slot, count } = row;
          console.log(class_id, slot, count);
          var isFull = false;
          const prefix = "want another slot";
          console.log('maxlearnerscount is',maxLearnersCount);
          console.log('classid is',class_id);
          console.log('count is',maxLearnersCount[class_id]);
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


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
