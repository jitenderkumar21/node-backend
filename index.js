const express = require('express');
const app = express();
const port = 3000;
const csvWriter = require('csv-writer');
const cors = require('cors');
const sendEmail = require('./emailSender');
const sendEmailToUs = require('./emailSenderUs');
const googleSheets = require('./googleSheet'); // Import the module
const classesInfo = require('./classesInfo'); // Import the module


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


app.get('/test', (req, res) => {

  sendEmail('jitender.kumar@iitgn.ac.in'); // Call the sendEmail function

  res.status(200).json({ message: 'Email sent successfully' });

});

app.get('/info', async (req, res) => {
  const classes = await classesInfo();
  console.log('classes',classes);
  res.json(classes);
});



app.post('/save', (req, res) => {

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
      const { classid, timeslot } = classDetail;
      if (timeslot){
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
  res.status(200).json({ message: 'Registration Successful' });

  });



  app.get('/classes', (req, res) => {

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
          if(count >=3){
            isFull = true;
          }

          if (!classes[class_id]) {
            classes[class_id] = {

                class_id,
              slots: [],
            };
          }
          classes[class_id].slots.push({
            slot,
            isFull,
          });
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
