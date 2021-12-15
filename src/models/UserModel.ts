// src/models/UserModel.ts
import { Knex } from 'knex'

export default class UserModel {
  db: Knex
  TABLE_NAME = 'sys_user'

  constructor(db: Knex) {
    this.db = db
  }

  async save(data: any) {
    return await this.db(this.TABLE_NAME)
      .returning('uid')
      .insert(data)
  }

  async findByUsername(username) {
    return await this.db(this.TABLE_NAME)
      .select()
      .where({ username })
  }
}
