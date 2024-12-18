import BaseRepository from './base-repository.js';
import { Config } from '../config.js';

export default new (class UserTokensRepository extends BaseRepository {
  constructor(tableName) {
    super(tableName);
  }

  async insertTokens({ user_id }) {
    return await this.getOneOrNull(
      `INSERT INTO ${this.table}(user_id, access_token, refresh_token, expiresAt) VALUES ($1, gen_random_uuid(), gen_random_uuid(), NOW() + $2 * INTERVAL '1 MINUTE') RETURNING *`,
      [user_id, Config.TOKEN_EXPIRY]
    );
  }

  async updateAccessToken({ refresh_token }) {
    return await this.getOneOrNull(
      `UPDATE ${this.table} SET access_token = GEN_RANDOM_UUID(), expiresat = NOW() + $2 * INTERVAL '1 MINUTE' WHERE refresh_token = $1 RETURNING *`,
      [refresh_token, Config.TOKEN_EXPIRY]
    );
  }

  async findByAccessToken({ access_token }) {
    return await this.findOne({ access_token });
  }

  async findByRefreshToken({ refresh_token }) {
    return await this.findOne({ refresh_token });
  }
})('user_tokens');
