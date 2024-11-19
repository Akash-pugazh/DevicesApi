import CustomError from '../util/CustomError.js';
import DeviceRepository from '../repository/device-repository.js';
import EntryRepository from '../repository/entry-repository.js';
import UserRepository from '../repository/user-repository.js';

export class DeviceService {
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

  async createDevice(req, res) {
    const { name, model, status } = req.body;
    const deviceData = await DeviceRepository.insertDevice({ name, model, status: status ?? 'GOOD' });
    return res.status(201).send(deviceData);
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

  static async assignDeviceByUserIdAndDeviceIdHelper({ deviceId, reason, userId }) {
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

    this.status(201).send('Device Rented');
  }

  async assignDeviceByAdmin(req, res, next) {
    const { userId, deviceId, reason } = req.body;
    await UserRepository.findUserById({ id: req.userId }).then(async data => {
      if (!data.isadmin || !userId) return next();
      await DeviceService.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
    });
  }

  async assignDevice(req, res) {
    const userId = req.userId;
    const { deviceId, reason } = req.body;
    await DeviceService.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
  }

  static async returnDeviceByUserIdAndDeviceIdHelper({ deviceId, deviceStatus, userId }) {
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
    this.status(200).send('Device Returned');
  }

  async returnDeviceByAdmin(req, res, next) {
    const { userId, deviceId, deviceStatus } = req.body;
    await UserRepository.findUserById({ id: req.userId }).then(async data => {
      if (!data.isadmin || !userId) return next();
      await DeviceService.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
    });
  }

  async returnDevice(req, res) {
    const userId = req.userId;
    const { deviceId, deviceStatus } = req.body;
    await DeviceService.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
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
}

export default new DeviceService();
