import db from '../db/index.js';
import BaseRepository from './base-repository.js';
import EntryRepository from './entry-repository.js';

export default new (class DeviceRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  fetchAllDevices() {
    return this.getAll();
  }

  insertDevice({ name, model, status }) {
    return this.insertOne({ name, model, status });
  }

  fetchByNameOrModel({ searchQuery }) {
    return this.find({ name: searchQuery, model: searchQuery }, false, true);
  }

  fetchOwnedDevices({ userId }) {
    const query = `
      SELECT 
        d.name device_name,
        d.model device_model,
        d.status device_status,
        e.rented_at rented_at,
        reason
      FROM entries e 
      JOIN devices d
      ON d.id = e.device_id
      WHERE returned_at IS NULL AND user_id = $1
    `;
    const values = [userId];
    return this.customQuery(query, values);
  }

  async fetchInStockDevices() {
    const query = `
      SELECT * FROM devices WHERE 
      status <> 'DEFECT' AND 
      id NOT IN (SELECT device_id FROM entries WHERE returned_at IS NULL)
    `;
    return await this.customQuery(query);
  }

  findDeviceById({ id }) {
    return this.findOne({ id });
  }



  async updateDeviceStatus({ id, status }) {
    return await this.update({ status }, { id });
  }
})('devices');
