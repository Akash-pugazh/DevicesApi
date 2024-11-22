import UserService from '../services/user-service.js';

export class UsersController {
  async getUsers(req, res) {
    const { q } = req.query;
    const data = q?.length >= 1 ? await UserService.findUsersByName({ name: q }) : await UserService.findUsers();

    res.status(200).send(data);
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
    console.log(data);

    res.status(201).send(data);
  }

  async deleteUser(req, res) {
    const id = req.params.id;

    await UserService.findUserById({ id });
    await UserService.deleteUserById({ id });

    res.status(200).send('User Deleted');
  }

  async changeUserPassword(req, res) {
    const { password: hashedPwd } = await UserService.findUserById({ id: req.userId });

    const { oldPassword, newPassword } = req.body;
    UserService.compareUserPassword({ password: oldPassword, hashedPwd });

    const newHashedPwd = UserService.hashUserPassword({ password: newPassword });
    await UserService.updateUserPassword({ id: req.userId, password: newHashedPwd });

    res.status(200).send('Password Updated');
  }
}

export default new UsersController();
