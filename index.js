const express = require('express');
const app = express();
const port = 3000;
const csvWriter = require('csv-writer');
const cors = require('cors');


app.use(express.json());

// Use the CORS middleware
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


const writer = csvWriter.createObjectCsvWriter({
    path: 'person-details.csv',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'message', title: 'Message' },
    ],
    append: true, // Append data to an existing file
  });
  


  
  // Define a route to handle POST requests
  app.post('/save', (req, res) => {
    // const personDetails = req.body;
  
    // // Validate that the JSON payload contains the required fields
    // if (!personDetails.name || !personDetails.email || !personDetails.message) {
    //   return res.status(400).json({ error: 'Invalid JSON payload' });
    // }
  
    // Write the person details to the CSV file
    // writer.writeRecords([personDetails])
    //   .then(() => {
    //     console.log('Person details saved to CSV');
    //     res.status(201).json({ message: 'Person details saved to CSV' });
    //   })
    //   .catch((error) => {
    //     console.error('Error writing to CSV:', error);
    //     res.status(500).json({ error: 'Failed to save person details' });
    //   });

      

      const { Client } = require('pg');

      const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

// Create a PostgreSQL client
const client = new Client({
  connectionString: connectionString,
});





  client.connect((err) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
      return;
    }
  
    const personDetails = req.body;
  
    // Validate that the JSON payload contains the required fields
    // if (!personDetails.name || !personDetails.email || !personDetails.message) {
    //   client.end(); // Close the database connection
    //   return res.status(400).json({ error: 'Invalid JSON payload' });
    // }
  
    // SQL query to insert data into the "users" table
    const insertQuery = `
      INSERT INTO users (name, email,message)
      VALUES ($1,$2, $3)
    `;
  
    const values = [personDetails.name, personDetails.email,personDetails.message];
  
    // Execute the query to insert data
    client.query(insertQuery, values, (queryErr) => {
      if (queryErr) {
        console.error('Error inserting data:', queryErr);
        res.status(500).json({ error: 'Error inserting data' });
      } else {
        console.log('Data inserted successfully');
        res.status(200).json({ message: 'Data inserted successfully' });
      }
  
      // Close the database connection
      client.end((endErr) => {
        if (endErr) {
          console.error('Error disconnecting from PostgreSQL:', endErr);
        }
      });
    });
  });

  


  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
