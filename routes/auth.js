import { Router } from 'express'
import { validateFields } from '../util/vaildator.js'
import { ValidationConstraint } from '../util/vaildator.js'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import AuthService from '../services/auth-service.js'

const authRouter = Router()

export const LoginValidationFields = {
  password: new ValidationConstraint({
    fieldType: 'string',
    minLength: 8,
    maxLength: 20,
  }),
  email: new ValidationConstraint({
    fieldType: 'string',
    minLength: 12,
  }),
}

export const RefreshValidationFields = {
  refreshToken: new ValidationConstraint({ fieldType: 'string' }),
}

authRouter
  .route('/login')
  .post(
    validateFields(LoginValidationFields),
    tryCatchWrapper(AuthService.loginUser)
  )

authRouter
  .route('/refresh')
  .post(
    validateFields(RefreshValidationFields),
    tryCatchWrapper(AuthService.generateAccessToken)
  )

export default authRouter
