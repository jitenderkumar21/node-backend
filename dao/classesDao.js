// dbFunctions.js
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function updateCounts(classDetails) {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();

    for (const classDetail of classDetails) {
      try {        
          await updateCountsForClassDetail(client, classDetail);
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

async function updateCountsForClassDetail(client, classDetail) {
  for (const timeslot of classDetail.timeslots) {
    await client.query(`
      INSERT INTO classes_count (class_id, sub_class_id, count)
      VALUES ($1, $2, 1)
      ON CONFLICT (class_id, sub_class_id) DO UPDATE SET count = classes_count.count + 1
    `, [classDetail.classid, timeslot.subClassId]);
  }
}

async function getAllClassCounts() {
  const countsMap = {};
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT class_id, sub_class_id, count
      FROM classes_count
    `);


    result.rows.forEach(row => {
      const { class_id, sub_class_id, count } = row;

      if (!countsMap[class_id]) {
        countsMap[class_id] = {};
      }

      countsMap[class_id][sub_class_id] = count;
    });

    
  } catch (error) {
    console.error('Error fetching counts:', error);
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
  // console.log(countsMap);
  return countsMap;
}

module.exports = {
  updateCounts,
  getAllClassCounts
};
