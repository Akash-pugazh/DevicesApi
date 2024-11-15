import { Router } from 'express';
import { ValidationConstraint } from '../util/vaildator.js';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import AuthService from '../services/auth-service.js';
import swaggerValidation from 'openapi-validator-middleware';

const authRouter = Router();

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

authRouter.route('/login').post(swaggerValidation.validate, tryCatchWrapper(AuthService.loginUser));
authRouter.route('/refresh').post(swaggerValidation.validate, tryCatchWrapper(AuthService.generateAccessToken));

export default authRouter;
