import db from '../db/index.js';
import BaseRepository from './base-repository.js';

export default new (class DeviceRepository extends BaseRepository {
  constructor(tableName) {
    super(tableName);
  }

  selectEntriesBaseQuery = `
    SELECT 
        e.id id,
        u.id user_id,
        u.name user_name,
        d.id device_id,
        d.name device_name,
        d.status,
        e.rented_at,
        e.returned_at,
        e.reason
    FROM entries e 
    LEFT JOIN users u ON u.id = e.user_id 
    LEFT JOIN devices d ON d.id = e.device_id    
    `;

  async fetchAllEntries({ username, devicename }) {
    let query = this.selectEntriesBaseQuery;
    let values = [];
    if (username || devicename) {
      query += `WHERE ${username ? 'u.name' : `${devicename ? 'd.name' : ''}`} ILIKE $1 `;

      username ? values.push(`%${username}%`) : devicename ? values.push(`%${devicename}%`) : (values = []);
    }

    query += `ORDER BY rented_at`;
    return await this.customQuery(query, values);
  }

  async fetchEntriesByDate({ startDate, endDate }) {
    let query = this.selectEntriesBaseQuery;
    let values = [];
    if (startDate && endDate) {
      query += 'WHERE d.rented_at BETWEEN $1 AND $2 ';
      values.push(startDate, endDate);
    } else if (startDate) {
      query += 'WHERE e.rented_at >= $1 ';
      values.push(startDate);
    } else if (endDate) {
      query += 'WHERE e.rented_at <= $1 ';
      values.push(endDate);
    }
    query += 'ORDER BY rented_at DESC';
    return await this.customQuery(query, values);
  }

  async insertEntry({ user_id, device_id, reason }) {
    return await this.insertOne({ user_id, device_id, reason });
  }

  async fetchEntryByUserAndDeviceId({ user_id, device_id }) {
    return await this.findOne({ user_id, device_id, returned_at: null });
  }

  async updateEntryReturnedAt({ user_id, device_id }) {
    return await this.customQuery(
      `UPDATE entries SET returned_at = CURRENT_TIMESTAMP WHERE device_id = $2 AND user_id = $1`,
      [user_id, device_id]
    );
  }
})('entries');
