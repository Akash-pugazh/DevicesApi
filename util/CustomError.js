export default class CustomErrorImpl {
  constructor({ statusCode, errorType = ERROR_TYPES.SIMPLE, errorMessage }) {
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorMessages = errorMessage;
  }

  constructErrJsonMessage() {
    let message, errors;
    switch (this.errorType) {
      case ERROR_TYPES.SIMPLE:
        message = typeof this.errorMessages === 'string' ? this.errorMessages : this.errorMessages[0];
        break;
      case ERROR_TYPES.INPUT_VALIDATION:
        message = 'Input Validation Error';
        break;
      default:
        message = 'Unknown Error';
        break;
    }

    if (this.errorType === ERROR_TYPES.INPUT_VALIDATION) {
      errors = this.errorMessages.map(errMsg => {
        return {
          field: errMsg?.field ?? errMsg,
          message: errMsg?.message ?? errMsg
        };
      });
    }

    return {
      message,
      errors
    };
  }
}

export const HTTP_CODES = {
  BAD_REQUEST: { code: 400, value: 'Bad Request' },
  UNAUTHORIZED: { code: 401, value: 'UnAuthorized' },
  NOT_FOUND: { code: 404, value: 'Not Found' },
  INTERNAL_SERVER_ERROR: { code: 500, value: 'Internal Server Error' }
};

export const ERROR_TYPES = {
  SIMPLE: 'SIMPLE',
  INPUT_VALIDATION: 'INPUT'
};

class UnAuthorizedError extends CustomErrorImpl {
  constructor({ errorMessage = HTTP_CODES.UNAUTHORIZED.value } = {}) {
    super({
      statusCode: HTTP_CODES.UNAUTHORIZED.code,
      errorType: ERROR_TYPES.SIMPLE,
      errorMessage
    });
  }
}

class BadRequestError extends CustomErrorImpl {
  constructor({ errorMessage = HTTP_CODES.BAD_REQUEST.value, errorType = ERROR_TYPES.SIMPLE } = {}) {
    super({
      statusCode: HTTP_CODES.BAD_REQUEST.code,
      errorType: errorType,
      errorMessage
    });
  }
}

class NotFoundError extends CustomErrorImpl {
  constructor({ errorMessage = HTTP_CODES.NOT_FOUND.value } = {}) {
    super({
      statusCode: HTTP_CODES.NOT_FOUND.code,
      errorType: ERROR_TYPES.SIMPLE,
      errorMessage
    });
  }
}

class InternalServerError extends CustomErrorImpl {
  constructor({ errorMessage = HTTP_CODES.INTERNAL_SERVER_ERROR.value } = {}) {
    super({
      statusCode: HTTP_CODES.INTERNAL_SERVER_ERROR.code,
      errorType: ERROR_TYPES.SIMPLE,
      errorMessage
    });
  }
}

export class ErrorFactory {
  static createError(err, errorMessage, errType) {
    switch (err) {
      case HTTP_CODES.BAD_REQUEST:
        return new BadRequestError({ errorMessage, errorType: errType });
      case HTTP_CODES.UNAUTHORIZED:
        return new UnAuthorizedError({ errorMessage });
      case HTTP_CODES.NOT_FOUND:
        return new NotFoundError({ errorMessage });
      case HTTP_CODES.INTERNAL_SERVER_ERROR:
        return new InternalServerError({ errorMessage });
      default:
        return new InternalServerError({ errorMessage });
    }
  }

  static throwError(err, errorMessage, errType) {
    throw ErrorFactory.createError(err, errorMessage, errType);
  }
}
