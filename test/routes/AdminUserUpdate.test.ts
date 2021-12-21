import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

const app = build()
const TABLE_NAME = 'sys_user'
const SYS_USER_ROLE = 'sys_user_role'
const SYS_ROLE = 'sys_role'
const credentials = { username: 'leenawat', password: 'P4ssword' }
const activeUser = {
  'username': 'leenawat',
  'password': 'P4ssword',
  'prename': '1',
  'fname': 'Leenawat',
  'lname': 'Papahom',
  'inactive': 0,
}
const roleUser = { name: 'user' }
const roleAdmin = { name: 'admin' }

const addUser = async (user = { ...activeUser }) => {
  user.password = await bcrypt.hashSync(user.password)
  return await db(TABLE_NAME).insert(user)
}

const addRole = async (roles: any[]) => {
  return await db(SYS_ROLE).insert(roles)
}

const addUserRole = async (userRoles : any[]) => {
  return await db(SYS_USER_ROLE).insert(userRoles)
}

const postAuthentication = async (credentials) => {
  return await app.inject({
    url: '/api/auth',
    method: 'post',
    payload: credentials,
  })
}

describe('Admin Update User', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
    await db(SYS_ROLE).truncate()
    await db(SYS_USER_ROLE).truncate()
  })

  it('return 403 when change inactive from invalid role', async () => {
    // Arrange
    const userId = await addUser()
    await addRole([roleUser])
    const rolesInDb = await db(SYS_ROLE).select()
    const userRoles = rolesInDb.map(role => {
      return {
        user_id: userId[0], role_id: role.id,
      }
    })
    await addUserRole(userRoles)
    const responseJwt = await postAuthentication(credentials)

    // Act
    const response = await app.inject({
      url: `/api/admin/users/${userId}/inactive/1`,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
      payload: {},
    })

    // Assert
    expect(response.statusCode).toBe(403)
  })

  it('return 200 when change inactive from valid role', async () => {
    // Arrange
    const userId = await addUser()
    await addRole([roleAdmin])
    const rolesInDb = await db(SYS_ROLE).select()
    const userRoles = rolesInDb.map(role => {
      return {
        user_id: userId[0], role_id: role.id,
      }
    })
    await addUserRole(userRoles)
    const responseJwt = await postAuthentication(credentials)

    // Act
    const response = await app.inject({
      url: `/api/admin/users/${userId}/inactive/1`,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
      payload: {},
    })

    // Assert
    expect(response.statusCode).toBe(200)
  })
})
