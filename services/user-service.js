import bcrypt from 'bcrypt';
import UserRepository from '../repository/user-repository.js';
import { Config } from '../config.js';
import { CustomError } from '../util/CustomError.js';

export class UserService {
  findUserByEmail = async ({ email }) => {
    const caseInsensitiveEmail = email.toLowerCase();
    return UserRepository.findByEmail({ email: caseInsensitiveEmail }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 404, errorMessage: 'User Not Found' }))
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
    return UserService.staticFindByUserId({ id, isactive });
  };

  static staticFindByUserId = async ({ id, isactive = true } = {}) => {
    return await UserRepository.findUserById({ id, isactive }).then(data => {
      return data
        .setupError(CustomError({ statusCode: 400, errorMessage: 'Invalid User Id' }))
        .setErrorCondition(data => !data)
        .build();
    });
  };

  deleteUserById = async ({ id }) => {
    return await UserRepository.deleteUserById({ id }).then(data => {
      return data.build();
    });
  };

  hashUserPassword = ({ password }) => {
    return bcrypt.hashSync(password, Config.SALT_ROUNDS);
  };

  compareUserPassword = ({ password, hashedPwd }) => {
    const isValidPassword = bcrypt.compareSync(password, hashedPwd);
    if (!isValidPassword) {
      throw CustomError({
        statusCode: 400,
        errorMessage: 'Invalid Password'
      });
    }
  };

  async isAdminMiddleware(req, res, next) {
    const userData = await UserService.staticFindByUserId({ id: req.userId, isactive: true });
    if (!userData.isadmin) throw CustomError({ statusCode: 401, errorMessage: 'Unauthorized' });
    next();
  }

  async insertUserInDb({ name, email, isadmin, password }) {
    return await UserRepository.insertUser({
      name,
      email,
      isadmin,
      password
    }).then(data => {
      return data.build();
    });
  }

  async updateUserPassword({ id, password }) {
    return await UserRepository.updatePassword({ id, password }).then(data => data.build());
  }
}

export default new UserService();
