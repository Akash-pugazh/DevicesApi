import CustomError, { ERROR_TYPES } from '../util/CustomError.js';
import openApiValidator from 'openapi-validator-middleware';

export default function errorHandler(server) {
  server.use((err, req, res, next) => {
    if (err instanceof openApiValidator.InputValidationError) {
      const customErrMap = err.errors.map(err => {
        let field = err.split(' ')[0];
        field = field.includes('/') ? field.split('/')[1] : field;
        return {
          field,
          message: err
        };
      });
      throw new CustomError({
        statusCode: 400,
        errorType: ERROR_TYPES.INPUT_VALIDATION,
        errorMessage: customErrMap
      });
    } else {
      next(err);
    }
  });

  server.use((err, req, res, next) => {
    res.emit('error', err);
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err.constructErrJsonMessage());
    }
    res.status(500).send({ error: err.message });
  });
}
