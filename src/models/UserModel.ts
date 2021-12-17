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
    const getModel = () => this.db(this.TABLE_NAME)
      .offset(page * size)
      .limit(size)
    const totalcount:any = await getModel().count()
    const content = await getModel().select()
    return {
      content,
      page,
      size,
      totalPages: Math.ceil(totalcount[0]['count(*)'] / size),
    }
  }
}
