import { Router } from 'express';
import { ValidationConstraint } from '../util/vaildator.js';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import AuthService from '../services/auth-service.js';
import openApiValidator from 'openapi-validator-middleware';
import Log from '../util/Log.js';

const authRouter = Router();
const validatorFn = openApiValidator.validate;

export const LoginValidationFields = {
  password: new ValidationConstraint({
    fieldType: 'string',
    minLength: 8,
    maxLength: 20
  }),
  email: new ValidationConstraint({
    fieldType: 'string',
    minLength: 12
  })
};

export const RefreshValidationFields = {
  refreshToken: new ValidationConstraint({
    fieldType: 'string'
  })
};

authRouter.route('/login').post(validatorFn, tryCatchWrapper(AuthService.loginUser));
authRouter.route('/refresh').post(validatorFn, tryCatchWrapper(AuthService.generateAccessToken));

export default authRouter;
