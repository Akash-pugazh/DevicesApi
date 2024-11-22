import db from '../db/index.js';
import BaseRepository from './base-repository.js';

export class DeviceRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename);
  }

  findDevices() {
    return this.getAll();
  }

  findByNameOrModel({ searchQuery }) {
    return this.find({ name: searchQuery, model: searchQuery }, { isMatchAll: false, isPartialFind: true });
  }

  insertDevice({ name, model, status }) {
    return this.insertOne({ name, model, status });
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

  fetchInStockDevices() {
    const query = `
      SELECT * FROM devices WHERE 
      status <> 'DEFECT' AND 
      id NOT IN (SELECT device_id FROM entries WHERE returned_at IS NULL)
    `;
    return this.customQuery(query);
  }

  findDeviceById({ id }) {
    return this.findOne({ id });
  }

  updateDeviceStatus({ id, status }) {
    return this.update({ status }, { id });
  }
}

export default new DeviceRepository('devices');
