// parentInfoDao.js
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function insertParentInfo(enrollmentDetails) {
  const client = new Client({
    connectionString: connectionString,
  });
  try {
    await client.connect();

    await client.query(`
      INSERT INTO parent_info (email, parent_name, child_name, child_age, communication_preference, phone_number, source, source_info, launch_enroll)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8m $9)
      ON CONFLICT (email) DO UPDATE
        SET child_name = EXCLUDED.child_name,
            child_age = EXCLUDED.child_age,
            parent_name = EXCLUDED.parent_name,
            phone_number = CASE WHEN EXCLUDED.phone_number <> '' THEN EXCLUDED.phone_number ELSE parent_info.phone_number END,
            communication_preference = EXCLUDED.communication_preference,
            source = CASE WHEN EXCLUDED.source <> '' THEN EXCLUDED.source ELSE parent_info.source END,
            source_info = CASE WHEN EXCLUDED.source_info <> '' THEN EXCLUDED.source_info ELSE parent_info.source_info END,
            launch_enroll = EXCLUDED.launch_enroll
    `, [
      enrollmentDetails.email,
      enrollmentDetails.parentName,
      enrollmentDetails.childName,
      enrollmentDetails.childAge,
      enrollmentDetails.commPref,
      enrollmentDetails.phoneNumber,
      enrollmentDetails.knowabout, // Map to source in the database
      enrollmentDetails.additionalInfo, // Map to source_info in the database
      enrollmentDetails.enroll_amount
    ]);

  } catch (error) {
    console.error('Error inserting/updating enrollment details:', error);
    // Log the error and continue without breaking the flow
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

async function getParentInfoByEmail(email) {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT *
      FROM parent_info
      WHERE email = $1
    `, [email]);

    if (result.rows.length > 0) {
      const parentInfo = result.rows[0];
      return {
        email: parentInfo.email,
        parentName: parentInfo.parent_name,
        childName: parentInfo.child_name,
        childAge: parentInfo.child_age,
        commPref: parentInfo.communication_preference,
        phoneNumber: parentInfo.phone_number,
        knowabout: parentInfo.source, // Map to knowabout
        additionalInfo: parentInfo.source_info, // Map to additional_info
        enroll_amount: parentInfo.launch_enroll
      };
    } else {
      return {}; // Return an empty JSON object if no matching record is found
    }

  } catch (error) {
    console.error('Error fetching parent info by email:', error);
    return {}; // Return an empty JSON object in case of an error
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

module.exports = {
  insertParentInfo,
  getParentInfoByEmail,
};
