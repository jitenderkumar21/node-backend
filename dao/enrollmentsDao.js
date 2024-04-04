const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
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
      const excludedEmails = ['aishwarya@coralacademy.com',
        'anisha@coralacademy.com',
        'jeet@coralacademy.com',
        'daanish@coralacademy.com',
        'shivam@coralacademy.com',
        'dhairya@coralacademy.com',
        'Aneesh@coralacademy.com',
        'ramesh.anand@mghyderabad.com',
        'mvskeerthi86@gmail.com',
        'sakshi@coralacademy.com',
        'vyshali@raamgroup.in',
        'shagun@raamgroup.in',
        'shagun@coralacademy.com',
        'rkongara.sap@gmail.com'];
      const emailNotInExcludedList = enrollment[3] && !excludedEmails.includes(enrollment[3].toLowerCase());
    
      return !parentNameContainsTest && !childNameContainsTest && emailNotInExcludedList;
    });
    // console.log('filteredEnrollments',filteredEnrollments);

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
        enrollment[11],
        enrollment[18],
        enrollment[19],
        enrollment[20],
        enrollment[21],
        enrollment[22],
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
    // console.log(enrollment);
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
  // if (!classId.includes('_')) {
  //   classId += '_1';
  // }
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

async function getEnrollmentsByClassId(filters = {}, pageNumber = 1) {
  const { classId} = filters;
  const queryParams = [];
  const conditions = [];

  let paramCount = 1;

  if (classId !== undefined && classId !== '') {
    conditions.push(`class_id = $${paramCount}::text`);
    queryParams.push(classId);
    paramCount++;
  }


  const pageSize = 10;
  const client = await connect();
  try {

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const totalCountResult = await client.query(
      `
      SELECT COUNT(*)
      FROM enrollments ${whereClause};
    `,queryParams);
    

    const totalEnrollments = parseInt(totalCountResult.rows[0].count, 10);
    const offset = (pageNumber - 1) * pageSize;
    

    const result = await client.query(`
        SELECT * FROM enrollments
        ${whereClause}
        ORDER BY timestamp
        LIMIT ${pageSize} OFFSET $${paramCount}::bigint
      `, [...queryParams, offset]);

    

    // Convert the result.rows to JSON objects
    const jsonEnrollments = result.rows.map(enrollment => {
      return {
        // timestamp: enrollment.timestamp,
        id: enrollment.id,
        class_id: enrollment.class_id, 
        parent_name: enrollment.parent_name,
        child_name: enrollment.child_name,
        email: enrollment.email,
        child_age: enrollment.child_age,
        phone_number: enrollment.phone_number,
        is_enrolled: enrollment.is_enrolled ? "TRUE" : "FALSE",
      };
    });
    
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
