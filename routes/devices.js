import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import DevicesController from '../controllers/devices.js';
import openApiValidator from 'openapi-validator-middleware';
import UserService from '../services/user-service.js';

const deviceRouter = Router();
const validatorFn = openApiValidator.validate;

deviceRouter
  .route('/')
  .get(validatorFn, tryCatchWrapper(DevicesController.getDevices))
  .post(validatorFn, tryCatchWrapper(UserService.isAdminMiddleware), tryCatchWrapper(DevicesController.createDevice));
deviceRouter.route('/owned').get(validatorFn, tryCatchWrapper(DevicesController.getOwnedDevices));
deviceRouter.route('/instock').get(validatorFn, tryCatchWrapper(DevicesController.getInStockDevices));
deviceRouter
  .route('/assign')
  .post(
    validatorFn,
    tryCatchWrapper(DevicesController.assignDeviceByAdmin),
    tryCatchWrapper(DevicesController.assignDevice)
  );
deviceRouter
  .route('/release')
  .post(
    validatorFn,
    tryCatchWrapper(DevicesController.returnDeviceByAdmin),
    tryCatchWrapper(DevicesController.returnDevice)
  );
deviceRouter.route('/:id').get(validatorFn, tryCatchWrapper(DevicesController.getDeviceById));

export default deviceRouter;
