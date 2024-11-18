import bcrypt from 'bcrypt';
import UserRepository from '../repository/user-repository.js';
import { Config } from '../config.js';
import CustomError from '../util/CustomError.js';

export default new (class UserService {
  async getUsers(req, res) {
    const { q } = req.query;
    const data = q?.length >= 1 ? await UserRepository.findByName({ name: q }) : await UserRepository.getAll();

    res.status(200).send(data);
  }

  async createUser(req, res) {
    const { name, email, password, isAdmin } = req.body;
    const hashedPwd = bcrypt.hashSync(password, Config.SALT_ROUNDS);
    const DEFAULT_ADMIN_ROLE_STATUS = false;
    await UserRepository.insertUser({
      name,
      email,
      isadmin: isAdmin ?? DEFAULT_ADMIN_ROLE_STATUS,
      password: hashedPwd
    }).then(data => {
      res.status(201).send(data);
    });
  }

  async deleteUser(req, res) {
    const id = req.params.id;
    const isUserValid = await UserRepository.findOne({ id });
    if (!isUserValid) {
      throw new CustomError({ statusCode: 400, errorMessage: 'Invalid User Id' });
    }
    await UserRepository.deleteById({ id });
    res.status(200).send('User Deleted');
  }

  async changePassword(req, res) {
    const user = await UserService.getUserById(req.userId);
    const { oldPassword, newPassword } = req.body;
    if (!user) {
      throw new CustomError({ statusCode: 401, errorMessage: 'UnAuthorized' });
    }
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new CustomError({ statusCode: 400, errorMessage: 'Invalid Password' });
    }
    const hashedPwd = bcrypt.hashSync(newPassword, Config.SALT_ROUNDS);
    UserRepository.update({ password: hashedPwd }, { id: user.id });
    res.status(200).send('Password Updated');

  }

  static async getUserById(userId) {
    return await UserRepository.findOne({ id: userId });
  }

  async checkIsAdminMiddeware(req, res, next) {
    const user = await UserService.getUserById(req.userId);
    if (!user.isadmin) throw new CustomError({ statusCode: 401, errorMessage: 'Unauthorized' });
    next();
  }
})();
