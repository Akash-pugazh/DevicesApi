import { Router } from 'express'
import { ValidationConstraint, validateFields } from '../util/vaildator.js'
import { LoginValidationFields } from './auth.js'
import tryCatchWrapper from '../util/tryCatchWrapper.js'
import UserService from '../services/user-service.js'

const userRouter = Router()

const UserCreateValidationFields = Object.assign(
  {
    name: new ValidationConstraint({
      fieldType: 'string',
      minLength: 3,
    }),
  },
  LoginValidationFields
)

userRouter
  .route('/')
  .get(tryCatchWrapper(UserService.getUsers))
  .post(
    validateFields(UserCreateValidationFields),
    tryCatchWrapper(UserService.createUser)
  )

export default userRouter
