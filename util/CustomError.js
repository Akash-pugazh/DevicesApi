export default class CustomError {
  constructor(statusCode, ...errorMessages) {
    this.statusCode = statusCode
    this.errorMessages = errorMessages
  }

  constructErrJsonMessage() {
    return {
      errors: this.errorMessages.map(errMsg => {
        return {
          field: errMsg?.field ?? errMsg,
          message: errMsg?.message ?? errMsg,
        }
      }),
    }
  }
}
