import { Router } from 'express'
import db from '../db/index.js'
import bcrypt from 'bcrypt'
import { ValidationConstraint, validateFields } from '../util/vaildator.js'
import { LoginValidationFields } from './auth.js'
import tryCatchWrapper from '../util/tryCatchWrapper.js'

const userRouter = Router()

const SALT_ROUNDS = 12

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
  .get(tryCatchWrapper(getUsers))
  .post(validateFields(UserCreateValidationFields), tryCatchWrapper(createUser))

async function getUsers(req, res, next) {
  let data
  const { q } = req.query
  if (q?.length >= 1) {
    const queryUsersDbResponse = await db.query(
      `SELECT * FROM users WHERE name ILIKE $1`,
      [`%${q}%`]
    )
    data = await queryUsersDbResponse.rows
  } else {
    const allUsersDbResponse = await db.query(`SELECT * FROM users`)
    data = await allUsersDbResponse.rows
  }
  res.status(200).send(data)
}

async function createUser(req, res, next) {
  const { name, email, password } = req.body

  const hashedPwd = bcrypt.hashSync(password, SALT_ROUNDS)
  const { rows: data } = await db.query(
    `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, hashedPwd]
  )
  res.status(201).send(data[0])
}

export default userRouter
