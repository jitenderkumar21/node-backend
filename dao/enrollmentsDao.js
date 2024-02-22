const { Client } = require('pg');
require('dotenv').config();

const connectionString = 'postgres://demo:C70BvvSmSUTniskWWxVq4uVjVPIzm76O@dpg-ckp61ns1tcps73a0bqfg-a.oregon-postgres.render.com/users_yyu1?ssl=true';

async function connect() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

async function disconnect(client) {
  try {
    await client.end();
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
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
  const pageSize = 10
  const client = await connect();

  try {
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

    // Convert the result.rows to JSON objects
    const jsonEnrollments = result.rows.map(enrollment => {
      return {
        // timestamp: enrollment.timestamp,
        parent_name: enrollment.parent_name,
        child_name: enrollment.child_name,
        email: enrollment.email,
        child_age: enrollment.child_age,
        phone_number: enrollment.phone_number,
      };
    });

    return {
      total: result.rowCount,
      pageSize: pageSize,
      pageNumber: pageNumber,
      totalPages: Math.ceil(result.rowCount / pageSize),
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
