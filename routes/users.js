import { Router } from 'express'
import db from '../db/index.js'
import bcrypt from 'bcrypt'
import jsonWebToken from 'jsonwebtoken'
import { LoginValidationFields, ValidationCheck } from './auth.js'

const userRouter = Router()

const SALT_ROUNDS = 12

const CreateValidationFields = Object.assign(
  {
    name: new ValidationCheck({
      fieldType: 'string',
      minLength: 3,
    }),
  },
  LoginValidationFields
)

userRouter
  .route('/')
  .get(getUsers)
  .post(validateFields(CreateValidationFields), createUser)

async function getUsers(req, res, next) {
  try {
    const { q } = req.query
    console.log(q)
    if (q?.length >= 1) {
      db.query(
        `SELECT * FROM users WHERE name ILIKE $1`,
        [`%${q}%`],
        (err, dbResult) => {
          if (err) throw err
          res.status(200).send(dbResult.rows)
        }
      )
      return
    }
    const dbResponse = await db.query(`SELECT * FROM users`)
    res.status(200).send(dbResponse.rows)
  } catch (err) {
    next(err)
  }
}

async function createUser(req, res, next) {
  const { name, email, password } = req.body
  try {
    const hashedPwd = bcrypt.hashSync(password, SALT_ROUNDS)
    const response = await db.query(
      `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPwd]
    )
    // delete response.rows[0].password
    // const userPayload = response.rows[0]
    // console.log(userPayload)
    // const accessToken = jsonWebToken.sign(
    //   userPayload,
    //   process.env.ACCESS_JWT_SECRET,
    //   { expiresIn: '30m' }
    // )

    // const refreshToken = jsonWebToken.sign(
    //   userPayload,
    //   process.env.REFRESH_JWT_SECRET,
    //   { expiresIn: '30d' }
    // )
    // await db.query(
    //   `INSERT INTO user_tokens(access_token, refresh_token) VALUES ($1, $2)`,
    //   [accessToken, refreshToken]
    // )
    res.status(201).send({ msg: 'User Created' })
  } catch (err) {
    next(err)
  }
}

export function validateFields(fields) {
  return function (req, res, next) {
    const inputBodyFields = Object.keys(req.body).map(key => key.toLowerCase())

    const validatorFields = Object.keys(fields)
    const isAllFieldsExist = validatorFields
      .map(key => key.toLowerCase())
      .every(el => inputBodyFields.includes(el))
    if (!isAllFieldsExist) {
      throw new Error('Invalid Request Body Provide all the valid fields')
    }

    // Check for field type validation
    validatorFields.forEach(field => {
      const currFieldValue = req.body[field]
      const validateFieldValue = fields[field]
      if (typeof currFieldValue !== validateFieldValue.fieldType) {
        throw new Error(
          `Invalid field type in Field ${field} Provided value ${typeof currFieldValue} Expected value ${
            validateFieldValue.fieldType
          }`
        )
      }
      if (
        !(
          currFieldValue.toString().length >= validateFieldValue.minLength &&
          currFieldValue.toString().length <= validateFieldValue.maxLength
        )
      ) {
        throw new Error(
          `
          Invalid length arguments in Field ${field} 
          Provided value Length : ${currFieldValue.toString().length}   
          Min Length : ${fields[field].minLength}
          Max Length : ${fields[field].maxLength}
          `
        )
      }
    })

    next()
  }
}

export default userRouter
