import { Router } from 'express';
import tryCatchWrapper from '../util/tryCatchWrapper.js';
import AuthService from '../services/auth-service.js';
import openApiValidator from 'openapi-validator-middleware';
import AuthController from '../controllers/auth.js';

const authRouter = Router();
const validatorFn = openApiValidator.validate;
authRouter.route('/login').post(validatorFn, tryCatchWrapper(AuthController.loginUser));
authRouter.route('/refresh').post(validatorFn, tryCatchWrapper(AuthController.refreshUserToken));

export default authRouter;
