import bcrypt from 'bcrypt';
import UserRepository from '../repository/user-repository.js';
import { Config } from '../config.js';
import CustomError from '../util/CustomError.js';
import { ConstructError } from './auth-service.js';

export class UserService {
  async getUsers(req, res) {
    const { q } = req.query;
    const data =
      q?.length >= 1
        ? await UserRepository.findByName({ name: q }).then(data => data.build())
        : await UserRepository.getAll().then(data => data.build());

    res.status(200).send(data);
  }

  async createUser(req, res) {
    const { name, email, password, isAdmin } = req.body;
    const hashedPwd = bcrypt.hashSync(password, Config.SALT_ROUNDS);
    const DEFAULT_ADMIN_ROLE_STATUS = false;
    const data = await UserRepository.insertUser({
      name,
      email,
      isadmin: isAdmin ?? DEFAULT_ADMIN_ROLE_STATUS,
      password: hashedPwd
    }).then(data => {
      return data.build();
    });

    res.status(201).send(data);
  }

  async deleteUser(req, res) {
    const id = req.params.id;

    await UserRepository.findOne({ id }).then(data => {
      return data
        .setupError(ConstructError({ statusCode: 400, errorMessage: 'Invalid User Id' }))
        .setErrorCondition(data => !data)
        .build();
    });
    await UserRepository.deleteById({ id }).then(data => {
      return data.build();
    });
    res.status(200).send('User Deleted');
  }

  async changePassword(req, res) {
    const { id, password } = await UserService.getUserById(req.userId);
    const { oldPassword, newPassword } = req.body;
    const isValidPassword = await bcrypt.compare(oldPassword, password);
    if (!isValidPassword) {
      throw new CustomError({ statusCode: 400, errorMessage: 'Invalid Password' });
    }
    const hashedPwd = bcrypt.hashSync(newPassword, Config.SALT_ROUNDS);
    await UserRepository.updatePassword({ id, password: hashedPwd }).then(data => {
      return data.build();
    });

    res.status(200).send('Password Updated');
  }

  static async getUserById(userId) {
    return await UserRepository.findOne({ id: userId }).then(data => data.build());
  }

  async checkIsAdminMiddeware(req, res, next) {
    await UserRepository.findOne({ id: req.userId }).then(data => {
      return data
        .setupError(ConstructError({ statusCode: 401, errorMessage: 'Unauthorized' }))
        .setErrorCondition(data => !data.isadmin)
        .build();
    });
    next();
  }
}

export default new UserService();
