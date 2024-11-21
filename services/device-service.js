import CustomError from '../util/CustomError.js';
import DeviceRepository from '../repository/device-repository.js';
import EntryRepository from '../repository/entry-repository.js';
import UserRepository from '../repository/user-repository.js';
import { ConstructError } from './auth-service.js';

export class DeviceService {
  async getAllDevices(req, res) {
    let query = req.query.q;
    const searchQuery = `%${query}%`;
    const data = query
      ? (await DeviceRepository.fetchByNameOrModel({ searchQuery })).build()
      : (await DeviceRepository.fetchAllDevices()).build();

    return res.status(200).send(data);
  }

  async getDevice(req, res) {
    let { id } = req.params;
    const data = (await DeviceRepository.findOne({ id }))
      .setupError(ConstructError({ statusCode: 404, errorMessage: 'Invalid Device Id' }))
      .setErrorCondition(data => !data)
      .build();
    return res.status(200).send(data);
  }

  async createDevice(req, res) {
    const { name, model, status } = req.body;
    const deviceData = await DeviceRepository.insertDevice({ name, model, status: status ?? 'GOOD' });
    return res.status(201).send(deviceData);
  }

  async getOwnedDevices(req, res) {
    const userId = req.userId;
    const data = (await DeviceRepository.fetchOwnedDevices({ userId })).build();
    res.status(200).send(data);
  }

  async getInStockDevices(req, res) {
    const data = (await DeviceRepository.fetchInStockDevices()).build();
    res.status(200).send(data);
  }

  static async assignDeviceByUserIdAndDeviceIdHelper({ deviceId, reason, userId }) {
    await DeviceService.isDeviceValid(deviceId);

    await DeviceService.checkIsDeviceCurrentlyTaken(deviceId);

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
    const data = (await UserRepository.findUserById({ id: req.userId })).build();
    if (!data.isadmin || !userId) return next();
    await DeviceService.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
  }

  async assignDevice(req, res) {
    const userId = req.userId;
    const { deviceId, reason } = req.body;
    await DeviceService.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
  }

  static async returnDeviceByUserIdAndDeviceIdHelper({ deviceId, deviceStatus, userId }) {
    await DeviceService.isUserHoldingDevice(userId, deviceId);

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
    const data = (await UserRepository.findUserById({ id: req.userId })).build();
    if (!data.isadmin || !userId) return next();
    await DeviceService.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
  }

  async returnDevice(req, res) {
    const userId = req.userId;
    const { deviceId, deviceStatus } = req.body;
    await DeviceService.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
  }

  static isUserHoldingDevice = async (user_id, device_id) => {
    return (
      await EntryRepository.fetchEntryByUserAndDeviceId({
        user_id,
        device_id
      })
    )
      .setupError(ConstructError({ statusCode: 400, errorMessage: 'Invalid Device Id' }))
      .setErrorCondition(data => !data)
      .build();
  };

  static isDeviceValid = async deviceId => {
    return (
      await DeviceRepository.findDeviceById({
        id: deviceId
      })
    )
      .setupError(ConstructError({ statusCode: 404, errorMessage: 'Device not found' }))
      .setErrorCondition(data => !data)
      .build();
  };

  static checkIsDeviceCurrentlyTaken = async deviceId => {
    return (
      await EntryRepository.isDeviceTakenBasedOnTheEntryRecord({
        device_id: deviceId
      })
    )
      .setupError(ConstructError({ statusCode: 400, errorMessage: 'Device is taken' }))
      .setErrorCondition(data => !data)
      .build();
  };
}

export default new DeviceService();
