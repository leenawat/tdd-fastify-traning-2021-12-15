// src/models/UserModel.ts
import { Knex } from 'knex'

export default class UserModel {
  db: Knex
  TABLE_NAME = 'sys_user'

  constructor(db: Knex) {
    this.db = db
  }

  async save(data: any) {
    try {
      const result = await this.db(this.TABLE_NAME)
        .insert(data)
      return { id: result[0], ...data }
    } catch (err) {
      return { err: 'Save Data Error' }
    }
  }

  async findByUsername(username) {
    return await this.db(this.TABLE_NAME)
      .select()
      .where({ username })
      .first()
  }
  async findById(id) {
    return await this.db(this.TABLE_NAME)
      .select('uid', 'username', 'prename', 'fname', 'lname', 'inactive')
      .where({ uid: id })
      .first()
  }

  async find(page = 0, size = 10) {
    const getModel = () => this.db(this.TABLE_NAME)
    const totalcount:any = await getModel().count()
    const content = await getModel()
      .offset(page * size)
      .limit(size)
      .select('uid', 'username', 'prename', 'fname', 'lname', 'inactive')
    return {
      content,
      page,
      size,
      totalPages: Math.ceil(totalcount[0]['count(*)'] / size),
    }
  }

  async update(id, body) {
    try {
      const result = await this.db(this.TABLE_NAME).update(body).where({ uid: id })
      return result
    } catch (err:any) {
      console.log({ err })
      if (Object.keys(err).includes('sql')) {
        return { err: 'SQL error' }
      } else {
        return { err }
      }
    }
  }

  async findUserRoles(username: any) {
    const result = await this.db('sys_user_role')
      .join('sys_role', 'sys_user_role.role_id', '=', 'sys_role.id')
      .select()
    return result
  }
}
