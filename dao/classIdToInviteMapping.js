const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function fetchClassInvitations() {
  // Create a new PostgreSQL client
  const client = new Client({
    connectionString: connectionString,
  });

  // Initialize inviteInfo object
  const inviteInfo = {};

  try {
    // Connect to the database
    await client.connect();

    // Query to fetch class_id and invite_id from the ClassInvitations table
    const query = 'SELECT class_id, invite_id FROM invite_info';

    // Execute the query
    const result = await client.query(query);

    // Populate inviteInfo object
    result.rows.forEach(row => {
      inviteInfo[row.class_id] = row.invite_id;
    });

    return inviteInfo;
  } catch (error) {
    console.error('Error executing query', error);
  } finally {
    // Close the connection in the finally block to ensure it happens even if an error occurs
    await client.end();
  }
}

async function insertClassInvitation(classId, inviteId) {
    // Create a new PostgreSQL client
    const client = new Client({
      connectionString: connectionString,
    });
  
    try {
      // Connect to the database
      await client.connect();
  
      // Insert values into the invite_info table
      const query = 'INSERT INTO invite_info (class_id, invite_id) VALUES ($1, $2)';
      await client.query(query, [classId, inviteId]);
  
      console.log(`Inserted values into invite_info: class_id=${classId}, invite_id=${inviteId}`);
    } catch (error) {
      console.error('Error executing query', error);
    } finally {
      // Close the connection in the finally block to ensure it happens even if an error occurs
      await client.end();
    }
  }
  
  module.exports = {
    fetchClassInvitations,
    insertClassInvitation,
  };