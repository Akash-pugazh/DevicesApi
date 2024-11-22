import { CustomError } from '../util/CustomError.js';
import DeviceRepository from '../repository/device-repository.js';
import EntryRepository from '../repository/entry-repository.js';

export class DeviceService {
  findDevicesByNameOrModel = async ({ searchQuery }) => {
    return await DeviceRepository.findByNameOrModel({ searchQuery });
  };

  findDevices = async () => {
    return await DeviceRepository.findDevices().then(data => data.build());
  };

  insertDevice = async ({ name, model, status }) => {
    return await DeviceRepository.insertDevice({ name, model, status }).then(data => {
      return data.build();
    });
  };

  getUserDevices = async ({ userId }) => {
    return await DeviceRepository.fetchOwnedDevices({ userId }).then(data => data.build());
  };

  getAvailableDevices = async () => {
    return await DeviceRepository.fetchInStockDevices().then(data => data.build());
  };

  findDeviceById = async ({ id }) => {
    return await DeviceRepository.findDeviceById({ id }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 404, errorMessage: 'Device not found' }))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  isDeviceTaken = async ({ id }) => {
    return await EntryRepository.isDeviceTakenBasedOnTheEntryRecord({ device_id: id }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 400, errorMessage: 'Device is taken' }))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  isUserHoldingDevice = async ({ user_id, device_id }) => {
    return await EntryRepository.fetchEntryByUserAndDeviceId({
      user_id,
      device_id
    }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 400, errorMessage: 'Invalid Device Id' }))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  updateDeviceStatus = async ({ id, status }) => {
    await DeviceRepository.updateDeviceStatus({ id, status });
  };
}

export default new DeviceService();
