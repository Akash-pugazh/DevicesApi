import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import UserService from '../services/user-service.js';
import openApiValidator from 'openapi-validator-middleware';

const userRouter = Router();
const validatorFn = openApiValidator.validate;

userRouter
  .route('/')
  .get(validatorFn, tryCatchWrapper(UserService.getUsers))
  .post(validatorFn, tryCatchWrapper(UserService.checkIsAdminMiddeware), tryCatchWrapper(UserService.createUser));
userRouter
  .route('/:id')
  .delete(validatorFn, tryCatchWrapper(UserService.checkIsAdminMiddeware), tryCatchWrapper(UserService.deleteUser));

export default userRouter;
