import UserService from '../services/user-service.js';
import HttpCodes from '../util/httpCodes.js';

export default new (class UsersController {
  async getUsers(req, res) {
    const { q } = req.query;
    const data = q?.length >= 1 ? await UserService.findUsersByName({ name: q }) : await UserService.findUsers();

    res.status(HttpCodes.OK).send(data);
  }

  async createUser(req, res) {
    const { name, email, password, isAdmin } = req.body;
    const hashedPwd = UserService.hashUserPassword({ password });

    const DEFAULT_ADMIN_ROLE_STATUS = false;
    const data = await UserService.insertUserInDb({
      name,
      email,
      password: hashedPwd,
      isadmin: isAdmin ?? DEFAULT_ADMIN_ROLE_STATUS
    });

    res.status(HttpCodes.CREATED).send(data);
  }

  async deleteUser(req, res) {
    const id = req.params.id;

    await UserService.findUserById({ id });
    await UserService.deleteUserById({ id });

    res.status(HttpCodes.OK).send('User Deleted');
  }

  async changeUserPassword(req, res) {
    const { password: hashedPwd } = await UserService.findUserById({ id: req.userId });

    const { oldPassword, newPassword } = req.body;
    UserService.compareUserPassword({ password: oldPassword, hashedPwd });

    const newHashedPwd = UserService.hashUserPassword({ password: newPassword });
    await UserService.updateUserPassword({ id: req.userId, password: newHashedPwd });

    res.status(HttpCodes.OK).send('Password Updated');
  }
})();
