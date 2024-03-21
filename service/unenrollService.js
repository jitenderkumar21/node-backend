const { Pool } = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool(
  {
    connectionString: connectionString
});

// Function to fetch reminders based on class_id and email
async function fetchReminders(classId, email) {
  try {
    // Define the query to fetch reminders
    const query = `
      SELECT *
      FROM reminders
      WHERE 
          additional_info->>'subClassId' = $1
          AND additional_info->>'email' = $2;
    `;

    // Execute the query
    const { rows } = await pool.query(query, [classId, email]);
    return rows;
  } catch (error) {
    console.error('Error fetching reminders', error);
    throw error;
  }
}

// Function to process reminders
async function processReminders(reminders,kidToUnenroll) {
    console.log('reminders',reminders);
  try {
    for (const reminder of reminders) {
      const { additional_info } = reminder;
      const { kidName } = additional_info;
      const isMultipleKid = isMultipleKids(kidName);
      
      if (isMultipleKid) {
        removeKidName(reminder, kidToUnenroll);
        await updateReminder(reminder.additional_info,reminder.id)
      } else {
        // Update reminder status to "CANCELLED"
        if(kidToUnenroll.trim() === reminder.additional_info.kidName.trim()){
            await cancelReminder(reminder.id);
        }
      }
    }
  } catch (error) {
    console.error('Error processing reminders', error);
    throw error;
  }
}

function isMultipleKids(kidName) {
    console.log('isMultipleKids', kidName);
    const namesArray = kidName.split(',').map(name => name.trim());
    const distinctNames = [...new Set(namesArray)];
    const isMultipleKids = distinctNames.length >= 2;
    return isMultipleKids;
}

// Function to remove a specific kidName from additional_info
function removeKidName(reminder, kidToUnenroll) {
    console.log("Removingkid ",reminder,kidToUnenroll);
  try {
    const { additional_info } = reminder;
    const { kidName } = additional_info;
    
    const kidNamesArray = kidName.split(',');

    const updatedKidNamesArray = kidNamesArray.filter(kid => kid.trim() !== kidToUnenroll.trim());

    const updatedKidName = updatedKidNamesArray.join(', ');
    console.log('updatedKidName',updatedKidName);
    reminder.additional_info.kidName = updatedKidName;
  } catch (error) {
    console.error('Error removing kidName from additional_info', error);
    throw error;
  }
}

// Function to update reminder status to "CANCELLED"
async function cancelReminder(reminderId) {
    console.log('cancelling reminder for ',reminderId);
  try {
    // Define the query to update reminder status
    const query = `
      UPDATE reminders
      SET reminder_status = 'CANCELLED'
      WHERE id = $1;
    `;

    // Execute the query
    await pool.query(query, [reminderId]);
  } catch (error) {
    console.error('Error cancelling reminder', error);
    throw error;
  }
}

async function updateReminder(additionInfo,reminderId) {
    console.log('updating reminder for ',reminderId);
  try {
    // Define the query to update reminder status
    const query = `
      UPDATE reminders
      SET additional_info = $2
      WHERE id = $1;
    `;

    // Execute the query
    await pool.query(query, [reminderId,additionInfo]);
  } catch (error) {
    console.error('Error cancelling reminder', error);
    throw error;
  }
}

async function unenroll(requests) {
    try {
      
      for (const request of requests) {
        const { class_id, email,child_name } = request;
        console.log(`Fetching and processing reminders for classId: ${class_id} and email: ${email}`);
  
        // Fetch reminders
        const reminders = await fetchReminders(class_id, email);
        console.log('Fetched reminders:', reminders);
  
        // Process reminders
        await processReminders(reminders,child_name);
        console.log('Reminders processed successfully');
      }
    } catch (error) {
      console.error('Error handling multiple requests:', error);
      throw error;
    }
  }

// Export the functions
module.exports = unenroll;
