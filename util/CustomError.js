export default class CustomErrorImpl {
  constructor({ statusCode, errorType = ERROR_TYPES.SIMPLE, errorMessage }) {
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorMessages = errorMessage;
  }

  constructErrJsonMessage() {
    let message = (() => {
      switch (this.errorType) {
        case ERROR_TYPES.SIMPLE:
          return typeof this.errorMessages === 'string' ? this.errorMessages : this.errorMessages[0];
        case ERROR_TYPES.INPUT_VALIDATION:
          return 'Input Validation Error';
        default:
          return 'Unknown Error';
      }
    })();

    let errors;
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

export const ERROR_TYPES = {
  SIMPLE: 'SIMPLE',
  INPUT_VALIDATION: 'INPUT'
};

export function CustomError({ statusCode, errorType = ERROR_TYPES.SIMPLE, errorMessage }) {
  return new CustomErrorImpl({ statusCode, errorType, errorMessage });
}
