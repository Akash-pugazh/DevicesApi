import BaseRepository from './base-repository.js'

export default new (class DeviceRepository extends BaseRepository {
  constructor(tablename) {
    super(tablename)
  }

  async fetchAllDevices() {
    return await this.getAll()
  }

  async fetchByNameOrModel({ searchQuery }) {
    return await this.find(
      { name: searchQuery, model: searchQuery },
      false,
      true
    )
  }

  async fetchOwnedDevices({ userId }) {
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
    `
    const values = [userId]
    return await this.customQuery(query, values)
  }

  async fetchInStockDevices() {
    const query = `
      SELECT * FROM devices WHERE 
      status <> 'DEFECT' AND 
      id NOT IN (SELECT device_id FROM entries WHERE returned_at IS NULL)
    `
    return await this.customQuery(query)
  }

  async findDeviceById({ id }) {
    return await this.find({ id })
  }

  async fetchDeviceByIdAndIsNotReturned({ id }) {
    return await this.customQuery(
      `SELECT * FROM entries WHERE device_id = $1 AND returned_at IS NULL`,
      [id]
    )
  }

  async updateDeviceStatus({ id, status }) {
    return await this.update({ status }, { id })
  }
})('devices')
