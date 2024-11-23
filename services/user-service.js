import bcrypt from 'bcrypt';
import UserRepository from '../repository/user-repository.js';
import { Config } from '../config.js';
import { ErrorFactory, ERROR_HTTP_CODES } from '../util/CustomError.js';

export default new (class UserService {
  findUserByEmail = async ({ email, isactive = true } = {}) => {
    const caseInsensitiveEmail = email.toLowerCase();
    return UserRepository.findUserByEmailAndIsActive({ email: caseInsensitiveEmail, isactive }).then(data => {
      return data
        .setupError(ErrorFactory.createError(ERROR_HTTP_CODES.NOT_FOUND, 'User Not Found'))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  findUsers = async ({ isactive = true } = {}) => {
    return await UserRepository.findUsers({ isactive }).then(data => data.build());
  };

  findUsersByName = async ({ name }) => {
    return await UserRepository.findUsersByName({ name }).then(data => data.build());
  };

  findUserById = async ({ id, isactive = true } = {}) => {
    return await UserRepository.findUserById({ id, isactive }).then(data => {
      return data
        .setupError(ErrorFactory.createError(ERROR_HTTP_CODES.BAD_REQUEST, 'Invalid User Id'))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  insertUserInDb = async ({ name, email, isadmin, password }) => {
    return await UserRepository.insertUser({
      name,
      email,
      isadmin,
      password
    }).then(data => data.build());
  };

  updateUserPassword = async ({ id, password }) => {
    return await UserRepository.updatePassword({ id, password }).then(data => data.build());
  };

  deleteUserById = async ({ id }) => {
    return await UserRepository.deleteUserById({ id }).then(data => {
      return data.build();
    });
  };

  isAdminMiddleware = async (req, res, next) => {
    const userData = await this.findUserById({ id: req.userId, isactive: true });
    if (!userData.isadmin) ErrorFactory.throwError(ERROR_HTTP_CODES.UNAUTHORIZED);
    next();
  };

  hashUserPassword = ({ password }) => {
    return bcrypt.hashSync(password, Config.SALT_ROUNDS);
  };

  compareUserPassword = ({ password, hashedPwd }) => {
    const isValidPassword = bcrypt.compareSync(password, hashedPwd);
    if (!isValidPassword) ErrorFactory.throwError(ERROR_HTTP_CODES.BAD_REQUEST, 'Invalid Password');
  };
})();
