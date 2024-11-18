import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import AuthService from '../services/auth-service.js';
import openApiValidator from 'openapi-validator-middleware';

const authRouter = Router();
const validatorFn = openApiValidator.validate;

authRouter.route('/login').post(validatorFn, tryCatchWrapper(AuthService.loginUser));
authRouter.route('/refresh').post(validatorFn, tryCatchWrapper(AuthService.generateAccessToken));

export default authRouter;
