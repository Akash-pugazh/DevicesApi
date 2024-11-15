import CustomError, { ERROR_TYPES } from '../util/CustomError.js'
import swaggerValidation from 'openapi-validator-middleware'

export default function errorHandler(server) {
  server.use((err, req, res, next) => {
    if (err instanceof swaggerValidation.InputValidationError) {
      const customErrMap = err.errors.map(err => {
        let field = err.split(' ')[0]
        field = field.includes('/') ? field.split('/')[1] : field
        return {
          field,
          message: err,
        }
      })
      throw new CustomError({
        statusCode: 400,
        errorType: ERROR_TYPES.INPUT_VALIDATION,
        errorMessage: customErrMap,
      })
    } else {
      next(err)
    }
  })

  server.use((err, req, res, next) => {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err.constructErrJsonMessage())
    }
    res.status(500).send({ error: err.message })
  })
}
