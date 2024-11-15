import CustomError from '../util/CustomError.js';
import DeviceRepository from '../repository/device-repository.js';
import EntryRepository from '../repository/entry-repository.js';

export default new (class DeviceService {
  async getAllDevices(req, res) {
    let query = req.query.q;
    const searchQuery = `%${query}%`;
    const data = query
      ? await DeviceRepository.fetchByNameOrModel({ searchQuery })
      : await DeviceRepository.fetchAllDevices();

    return res.status(200).send(data);
  }

  async getDevice(req, res) {
    let { id } = req.params;
    const data = await DeviceRepository.findOne({ id });
    return res.status(200).send(data);
  }

  async getOwnedDevices(req, res) {
    const userId = req.userId;
    const data = await DeviceRepository.fetchOwnedDevices({ userId });
    res.status(200).send(data);
  }

  async getInStockDevices(req, res) {
    const data = await DeviceRepository.fetchInStockDevices();
    res.status(200).send(data);
  }

  async assignDevice(req, res) {
    const userId = req.userId;
    const { deviceId, reason } = req.body;

    const validDevice = await DeviceService.isDeviceValid(deviceId);
    if (!validDevice) {
      throw new CustomError({
        statusCode: 404,
        errorMessage: 'Device not found'
      });
    }

    const isDeviceAvailableToRent = await DeviceService.isDeviceAvailableToRent(deviceId);
    if (!isDeviceAvailableToRent) {
      throw new CustomError({
        statusCode: 400,
        errorMessage: 'Device is taken'
      });
    }

    const DEFAULT_ENTRY_REASON = 'WFH';
    await EntryRepository.insertEntry({
      user_id: userId,
      device_id: deviceId,
      reason: reason ?? DEFAULT_ENTRY_REASON
    });

    res.status(201).send('Device Rented');
  }

  async returnDevice(req, res) {
    const userId = req.userId;
    const { deviceId, deviceStatus } = req.body;
    const isUserDevice = await DeviceService.isUserHoldingDevice(userId, deviceId);
    if (!isUserDevice) {
      throw new CustomError({
        statusCode: 400,
        errorMessage: 'Invalid Device Id'
      });
    }
    await EntryRepository.updateEntryReturnedAt({
      user_id: userId,
      device_id: deviceId
    });
    const DEFAULT_DEVICE_STATUS = 'GOOD';
    await DeviceRepository.updateDeviceStatus({
      id: deviceId,
      status: deviceStatus ?? DEFAULT_DEVICE_STATUS
    });
    res.status(200).send('Device Returned');
  }

  static isUserHoldingDevice = async (user_id, device_id) => {
    return await EntryRepository.fetchEntryByUserAndDeviceId({
      user_id,
      device_id
    });
  };

  static isDeviceValid = async deviceId =>
    await DeviceRepository.findDeviceById({
      id: deviceId
    });

  static isDeviceAvailableToRent = async deviceId => {
    return await DeviceRepository.isDeviceAvailableToRent({
      id: deviceId
    });
  };
})();
