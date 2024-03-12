const { Pool } = require('pg');
require('dotenv').config();

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';
const pool = new Pool(
  {
    connectionString: connectionString
});

async function connect() {
  try {
    console.time('GettingConnection');
    const client = await pool.connect();
    console.timeEnd('GettingConnection');
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Error connecting to the database');
  }
}

async function disconnect(client) {
  try {
    console.time('Disconnecting');
    await client.release();
    console.timeEnd('Disconnecting');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
    throw new Error('Error disconnecting from the database');
  }
}

async function bulkInsertEnrollments(enrollments) {
  
  try {
    // Implement the bulk insert logic here
    const filteredEnrollments = enrollments.filter(enrollment => {
      const parentNameContainsTest = enrollment[1] && enrollment[1].toLowerCase().includes('test');
      const childNameContainsTest = enrollment[2] && enrollment[2].toLowerCase().includes('test');
      
      return !parentNameContainsTest && !childNameContainsTest;
    });
    console.log('filteredEnrollments',filteredEnrollments);

    const values = filteredEnrollments.map((enrollment) => {
      return [
        enrollment[0],
        enrollment[1],
        enrollment[2],
        enrollment[3],
        enrollment[4],
        enrollment[5],
        enrollment[6],
        enrollment[7],
        enrollment[8],
        enrollment[9],
        enrollment[10],
        enrollment[15],
        enrollment[16],
        enrollment[17],
        enrollment[18],
        enrollment[19],
      ];
    });
    // const enrollment = enrollments[0];
    // console.log(enrollments);
    values.forEach((enrollment) => {
        insertEnrollment(enrollment);
    });

    console.log('Enrollments bulk inserted successfully');
  } catch (error) {
    console.error('Error inserting enrollments:', error);
    throw error;
  } finally {
  }
}

async function insertEnrollment(enrollment){
    console.log(enrollment);
    const client = await connect();
    try{
        await client.query({ text :`
        INSERT INTO enrollments (
            timestamp, parent_name, child_name, email, child_age,comm_pref , phone_number, teacher_name,
            source, source_info, class_id, want_another_slot, country, region, city, time_zone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (email, class_id, child_name) DO NOTHING; -- Ignore duplicates
        `, values: enrollment});

    }catch (error) {
        console.error('Error inserting enrollments:', error);
        throw error;
      } finally {
        await disconnect(client);
      }
}

async function getChildInfoByClassId(classId) {
  if (!classId.includes('_')) {
    classId += '_1';
  }
  const client = await connect();

  try {
    const result = await client.query(`
      SELECT child_name, child_age
      FROM enrollments
      WHERE class_id = $1 AND is_enrolled = true;
    `, [classId]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching child info for Teacher Reminder:', error);
    throw new Error('Error fetching child info for Teacher Reminder');
  } finally {
    await disconnect(client);
  }
}

async function getEnrollmentsByClassId(classId, pageNumber = 1) {
  const pageSize = 10;
  console.time('GettingConnection');
  const client = await connect();
  console.timeEnd('GettingConnection');
  try {
    console.time('getEnrollmentsByClassId'); // Start timing

    console.time('getTotalCount'); // Start timing for total count query

    const totalCountResult = await client.query(
      `
      SELECT COUNT(*)
      FROM enrollments;
    `);
    console.timeEnd('getTotalCount'); // End timing for total count query

    const totalEnrollments = parseInt(totalCountResult.rows[0].count, 10);

    console.time('getPaginatedEnrollments'); 
    const offset = (pageNumber - 1) * pageSize;
    const result = await client.query(
      `
      SELECT *
      FROM enrollments
      WHERE class_id = $1
      ORDER BY timestamp
      OFFSET $2
      LIMIT $3;
    `,
      [classId, offset, pageSize]
    );

    console.timeEnd('getPaginatedEnrollments');
    

    // Convert the result.rows to JSON objects
    const jsonEnrollments = result.rows.map(enrollment => {
      return {
        // timestamp: enrollment.timestamp,
        id: enrollment.id,
        parent_name: enrollment.parent_name,
        child_name: enrollment.child_name,
        email: enrollment.email,
        child_age: enrollment.child_age,
        phone_number: enrollment.phone_number,
      };
    });
    console.timeEnd('getEnrollmentsByClassId'); // End timing
    return {
      total: totalEnrollments,
      pageSize: pageSize,
      pageNumber: pageNumber,
      totalPages: Math.ceil(totalEnrollments / pageSize),
      enrollments: jsonEnrollments,
    };
  } catch (error) {
    console.error('Error fetching paginated enrollments by classId:', error);
    throw new Error('Error fetching paginated enrollments by classId');
  } finally {
    await disconnect(client);
  }
}

module.exports = {
  bulkInsertEnrollments,
  getChildInfoByClassId,
  getEnrollmentsByClassId,
};
