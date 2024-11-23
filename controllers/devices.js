import DevicesService from '../services/device-service.js';
import EntryService from '../services/entry-service.js';
import UserService from '../services/user-service.js';
import HttpCodes from '../util/httpCodes.js';

export default new (class DevicesController {
  async getDevices(req, res) {
    let query = req.query.q;
    const searchQuery = `%${query}%`;
    const data =
      query?.length >= 1
        ? await DevicesService.findDevicesByNameOrModel({ searchQuery })
        : await DevicesService.findDevices();
    return res.status(HttpCodes.OK).send(data);
  }

  async getDeviceById(req, res) {
    const { id } = req.params;
    const data = await DevicesService.findDeviceById({ id });
    return res.status(HttpCodes.OK).send(data);
  }

  async createDevice(req, res) {
    const { name, model, status } = req.body;
    const DEFAULT_DEVICE_STATUS = 'GOOD';
    const data = await DevicesService.insertDevice({ name, model, status: status ?? DEFAULT_DEVICE_STATUS });

    return res.status(HttpCodes.CREATED).send(data);
  }

  async getOwnedDevices(req, res) {
    const userId = req.userId;
    const data = await DevicesService.getUserDevices({ userId });
    res.status(HttpCodes.OK).send(data);
  }

  async getInStockDevices(req, res) {
    const data = await DevicesService.getAvailableDevices();
    res.status(HttpCodes.OK).send(data);
  }

  static async assignDeviceByUserIdAndDeviceIdHelper({ deviceId, reason, userId }) {
    await DevicesService.findDeviceById({ id: deviceId });
    await DevicesService.isDeviceTaken({ id: deviceId });

    const DEFAULT_ENTRY_REASON = 'WFH';
    await EntryService.insertEntry({ user_id: userId, device_id: deviceId, reason: reason ?? DEFAULT_ENTRY_REASON });

    this.status(HttpCodes.CREATED).send('Device Rented');
  }

  async assignDeviceByAdmin(req, res, next) {
    const { userId, deviceId, reason } = req.body;
    if (!userId) return next();
    const data = await UserService.findUserById({ id: req.userId });

    if (!data.isadmin || !userId) return next();
    await DevicesController.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
  }

  async assignDevice(req, res) {
    const userId = req.userId;
    const { deviceId, reason } = req.body;
    await DevicesController.assignDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, reason, userId });
  }

  static async returnDeviceByUserIdAndDeviceIdHelper({ deviceId, deviceStatus, userId }) {
    await DevicesService.isUserHoldingDevice({ user_id: userId, device_id: deviceId });
    await EntryService.updateEntryReturnedAt({ user_id: userId, device_id: deviceId });
    const DEFAULT_DEVICE_STATUS = 'GOOD';
    await DevicesService.updateDeviceStatus({ id: deviceId, status: deviceStatus ?? DEFAULT_DEVICE_STATUS });
    this.status(HttpCodes.OK).send('Device Returned');
  }

  async returnDeviceByAdmin(req, res, next) {
    const { userId, deviceId, deviceStatus } = req.body;
    if (!userId) return next();
    const data = await UserService.findUserById({ id: userId });
    if (!data.isadmin || !userId) return next();
    await DevicesController.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
  }

  async returnDevice(req, res) {
    const userId = req.userId;
    const { deviceId, deviceStatus } = req.body;
    await DevicesController.returnDeviceByUserIdAndDeviceIdHelper.bind(res)({ deviceId, deviceStatus, userId });
  }
})();
