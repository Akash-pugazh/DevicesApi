export class ValidationConstraint {
  constructor({ fieldType, minLength, maxLength }) {
    this.fieldType = fieldType;
    this.minLength = minLength ?? 1;
    this.maxLength = maxLength ?? Number.POSITIVE_INFINITY;
  }
}

export function validateFields(fields) {
  return function (req, res, next) {
    const inputBodyFields = Object.keys(req.body).map(key => key.toLowerCase());

    const validatorFields = Object.keys(fields);
    const isAllFieldsExist = validatorFields.map(key => key.toLowerCase()).every(el => inputBodyFields.includes(el));
    if (!isAllFieldsExist) {
      throw new Error('Invalid Request Body Provide all the valid fields');
    }

    // Check for field type validation
    validatorFields.forEach(field => {
      const currFieldValue = req.body[field];
      const validateFieldValue = fields[field];
      if (typeof currFieldValue !== validateFieldValue.fieldType) {
        throw new Error(
          `Invalid field type in Field ${field} Provided value ${typeof currFieldValue} Expected value ${
            validateFieldValue.fieldType
          }`
        );
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
        );
      }
    });

    next();
  };
}
