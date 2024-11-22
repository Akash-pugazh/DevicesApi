import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import UserService from '../services/user-service.js';
import openApiValidator from 'openapi-validator-middleware';
import UsersController from '../controllers/users.js';

const userRouter = Router();
const validatorFn = openApiValidator.validate;

userRouter
  .route('/')
  .get(validatorFn, tryCatchWrapper(UsersController.getUsers))
  .post(validatorFn, tryCatchWrapper(UserService.isAdminMiddleware), tryCatchWrapper(UsersController.createUser));
userRouter
  .route('/:id')
  .delete(validatorFn, tryCatchWrapper(UserService.isAdminMiddleware), tryCatchWrapper(UsersController.deleteUser));
userRouter.route('/change-password').post(validatorFn, tryCatchWrapper(UsersController.changeUserPassword));

export default userRouter;
