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
      .first()
  }
  async find(page = 0, size = 10) {
    const userList = await this.db(this.TABLE_NAME)
      .select()
      .offset(page * size)
      .limit(size)
    return {
      content: userList,
      page,
      size,
      totalPages: Math.ceil(userList.length / size),
    }
  }
}
