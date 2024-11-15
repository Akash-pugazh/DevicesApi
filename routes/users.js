import { Router } from 'express';
import { ValidationConstraint, validateFields } from '../util/vaildator.js';
import { LoginValidationFields } from './auth.js';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import UserService from '../services/user-service.js';
import openApiValidator from 'openapi-validator-middleware';

const userRouter = Router();

const UserCreateValidationFields = Object.assign(
  {
    name: new ValidationConstraint({
      fieldType: 'string',
      minLength: 3
    })
  },
  LoginValidationFields
);

userRouter.route('/').get(openApiValidator.validate, tryCatchWrapper(UserService.getUsers)).post(
  openApiValidator.validate,
  tryCatchWrapper(UserService.checkIsAdminMiddeware),
  tryCatchWrapper(UserService.createUser)
);
userRouter
  .route('/:id')
  .delete(
    openApiValidator.validate,
    tryCatchWrapper(UserService.checkIsAdminMiddeware),
    tryCatchWrapper(UserService.deleteUser)
  );

export default userRouter;
