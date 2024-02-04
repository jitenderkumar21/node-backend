// dbFunctions.js

const { Client } = require('pg');

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

async function updateCounts(classDetails) {
    console.log(classDetails);
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();

    for (const classDetail of classDetails) {
      try {
        const classTagLower = classDetail.classTag.toLowerCase();
        console.log('classDetail',classDetail);
        if (classTagLower === 'onetime' || classTagLower === 'course') {
          await updateCountsForClassId(client, classDetail.classid);
        } else {
          await updateCountsForClassDetail(client, classDetail);
        }
      } catch (error) {
        console.error(`Error updating counts for classDetail ${classDetail.classid}:`, error);
      }
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

// Function to update counts for a specific classDetail
async function updateCountsForClassDetail(client, classDetail) {
  for (const timeslot of classDetail.timeslots.filter(timeslot => !timeslot.isPast)) {
    await client.query(`
      INSERT INTO sub_class_counts (sub_class_id, count)
      VALUES ($1, 1)
      ON CONFLICT (sub_class_id) DO UPDATE SET count = sub_class_counts.count + 1
    `, [timeslot.subClassId]);
  }
}

// Function to update counts for a specific classId
async function updateCountsForClassId(client, classId) {
  await client.query(`
    INSERT INTO sub_class_counts (sub_class_id, count)
    VALUES ($1, 1)
    ON CONFLICT (sub_class_id) DO UPDATE SET count = sub_class_counts.count + 1
  `, [classId]);
}

module.exports = updateCounts;
