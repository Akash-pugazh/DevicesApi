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
        ? (await UserRepository.findByName({ name: q })).build()
        : (await UserRepository.fetchAllUsers()).build();

    res.status(200).send(data);
  }

  async createUser(req, res) {
    const { name, email, password, isAdmin } = req.body;
    const hashedPwd = bcrypt.hashSync(password, Config.SALT_ROUNDS);
    const DEFAULT_ADMIN_ROLE_STATUS = false;
    const data = (
      await UserRepository.insertUser({
        name,
        email,
        isadmin: isAdmin ?? DEFAULT_ADMIN_ROLE_STATUS,
        password: hashedPwd
      })
    ).build();
    res.status(201).send(data);
  }

  async deleteUser(req, res) {
    const id = req.params.id;

    (await UserRepository.findOne({ id }))
      .setupError(ConstructError({ statusCode: 400, errorMessage: 'Invalid User Id' }))
      .setErrorCondition(data => !data)
      .build();

    UserRepository.deleteById({ id });
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
    (await UserRepository.updatePassword({ id, password: hashedPwd })).build();
    res.status(200).send('Password Updated');
  }

  static async getUserById(userId) {
    return (await UserRepository.findOne({ id: userId }))
      .setupError(ConstructError({ statusCode: 401, errorMessage: 'Unauthorized' }))
      .setErrorCondition(data => !data.isadmin)
      .build();
  }

  async checkIsAdminMiddeware(req, res, next) {
    await UserService.getUserById(req.userId);
    next();
  }
}

export default new UserService();
