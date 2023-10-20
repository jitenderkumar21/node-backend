const express = require('express');
const app = express();
const port = 3000;
const csvWriter = require('csv-writer');


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
  
  app.use(express.json());
  
  // Define a route to handle POST requests
  app.post('/save', (req, res) => {
    const personDetails = req.body;
  
    // Validate that the JSON payload contains the required fields
    if (!personDetails.name || !personDetails.email || !personDetails.message) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  
    // Write the person details to the CSV file
    writer.writeRecords([personDetails])
      .then(() => {
        console.log('Person details saved to CSV');
        res.status(201).json({ message: 'Person details saved to CSV' });
      })
      .catch((error) => {
        console.error('Error writing to CSV:', error);
        res.status(500).json({ error: 'Failed to save person details' });
      });
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
