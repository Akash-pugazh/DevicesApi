import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import DeviceService from '../services/device-service.js';
import openApiValidator from 'openapi-validator-middleware';
import UserService from '../services/user-service.js';

const deviceRouter = Router();
const validatorFn = openApiValidator.validate;

deviceRouter
  .route('/')
  .get(validatorFn, tryCatchWrapper(DeviceService.getAllDevices))
  .post(validatorFn, tryCatchWrapper(UserService.checkIsAdminMiddeware), tryCatchWrapper(DeviceService.createDevice));
deviceRouter.route('/owned').get(validatorFn, tryCatchWrapper(DeviceService.getOwnedDevices));
deviceRouter.get('/instock', validatorFn, tryCatchWrapper(DeviceService.getInStockDevices));
deviceRouter
  .route('/assign')
  .post(validatorFn, tryCatchWrapper(DeviceService.assignDeviceByAdmin), tryCatchWrapper(DeviceService.assignDevice));
deviceRouter
  .route('/release')
  .post(validatorFn, tryCatchWrapper(DeviceService.returnDeviceByAdmin), tryCatchWrapper(DeviceService.returnDevice));
deviceRouter.route('/:id').get(validatorFn, tryCatchWrapper(DeviceService.getDevice));

export default deviceRouter;
