import CustomError from '../util/CustomError.js'
import DeviceRepository from '../repository/device-repository.js'
import EntryRepository from '../repository/entry-repository.js'

export default new (class DeviceService {
  async getAllDevices(req, res, next) {
    let query = req.query.q
    const searchQuery = `%${query}%`
    const { rows: data } = query
      ? await DeviceRepository.fetchByNameOrModel({ searchQuery })
      : await DeviceRepository.fetchAllDevices()

    return res.status(200).send(data)
  }

  async getOwnedDevices(req, res) {
    const userId = req.userId
    const { rows } = await DeviceRepository.fetchOwnedDevices({ userId })
    res.status(200).send(rows)
  }

  async getInStockDevices(req, res, next) {
    const { rows: data } = await DeviceRepository.fetchInStockDevices()
    res.status(200).send(data)
  }

  async assignDevice(req, res, next) {
    const userId = req.userId
    const { deviceId, reason } = req.body
    if (!(await DeviceService.isDeviceValid(deviceId))) {
      throw new CustomError(404, 'Device not found')
    }
    if (!(await DeviceService.isDeviceAvailable(deviceId))) {
      throw new CustomError(400, 'Device is taken')
    }

    const DEFAULT_ENTRY_REASON = 'WFH'
    await EntryRepository.insertEntry({
      user_id: userId,
      device_id: deviceId,
      reason: reason ?? DEFAULT_ENTRY_REASON,
    })

    res.status(201).send('Device Rented')
  }

  async returnDevice(req, res, next) {
    const userId = req.userId
    const { deviceId, deviceStatus } = req.body
    const { rowCount: entryRowCount } =
      await EntryRepository.fetchNotReturnedEntryByUserIdAndDeviceIdIs({
        user_id: userId,
        device_id: deviceId,
      })
    if (entryRowCount === 0) {
      throw new CustomError(400, 'Invalid Device Id')
    }
    await EntryRepository.updateEntryReturnedAt({
      user_id: userId,
      device_id: deviceId,
    })
    const DEFAULT_DEVICE_STATUS = 'GOOD'
    await DeviceRepository.updateDeviceStatus({
      id: deviceId,
      status: deviceStatus ?? DEFAULT_DEVICE_STATUS,
    })
    res.status(200).send('Device Returned')
  }

  static async isDeviceValid(deviceId) {
    try {
      const { rowCount } = await DeviceRepository.findDeviceById({
        id: deviceId,
      })
      return rowCount === 1
    } catch (err) {
      throw err
    }
  }

  static async isDeviceAvailable(deviceId) {
    try {
      const { rowCount } =
        await DeviceRepository.fetchDeviceByIdAndIsNotReturned({ id: deviceId })
      return rowCount === 0
    } catch (err) {
      throw err
    }
  }
})()
