const { Pool } = require('pg');
require('dotenv').config();
const moment = require('moment-timezone');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const pageSize = 10;

async function insertSystemReport(systemReportData) {

  const client = await pool.connect();
  try {
    try {        
      await insertSystemReportData(client, systemReportData);
    } catch (error) {
      console.error('Error inserting system report data:', error);
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    try {
      client.release();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

async function insertSystemReportData(client, reportData) {
  const { classId, channel, type, status, reason, parentEmail, reminderId } = reportData;
  const responseTime = moment(new Date()).tz('Asia/Kolkata').format('DD MMM YYYY HH:mm');
  await client.query(`
    INSERT INTO system_report (response_time, class_id, channel, type, status, reason, parent_email, reminder_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    responseTime,
    classId,
    channel,
    type,
    status,
    reason,
    parentEmail,
    reminderId,
  ]);
}

async function getAllSystemReports(filters = {}, pageNumber = 1) {
  const { classId, status, channel, type } = filters;
  const queryParams = [];
  const conditions = [];

  let paramCount = 1;

  if (classId !== undefined && classId !== '') {
    conditions.push(`class_id = $${paramCount}`);
    queryParams.push(classId);
    paramCount++;
  }

  if (status !== undefined && status !== '') {
    conditions.push(`status = $${paramCount}::text`);
    queryParams.push(status);
    paramCount++;
  }

  if (channel !== undefined && channel !== '') {
    conditions.push(`channel = $${paramCount}::text`);
    queryParams.push(channel);
    paramCount++;
  }

  if (type !== undefined && type !== '') {
    conditions.push(`type = $${paramCount}::text`);
    queryParams.push(type);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (pageNumber - 1) * pageSize;

  try {
    const client = await pool.connect();
    try {
      const countResult = await client.query(`
        SELECT COUNT(*) FROM system_report
        ${whereClause}
      `, queryParams);

      const totalRecords = parseInt(countResult.rows[0].count, 10);

      const result = await client.query(`
        SELECT * FROM system_report
        ${whereClause}
        LIMIT ${pageSize} OFFSET $${paramCount}::bigint
      `, [...queryParams, offset]);

      const totalPages = Math.ceil(totalRecords / pageSize);
      const systemReport = result.rows;

      return {
        total: totalRecords,
        pageSize: pageSize,
        pageNumber: pageNumber,
        totalPages: totalPages,
        report: systemReport,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching system reports:', error);
    return {
      total: 0,
      pageSize: pageSize,
      pageNumber: pageNumber,
      totalPages: 0,
      report: [],
    };
  }
}

module.exports = {
  insertSystemReport,
  getAllSystemReports,
};
