import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'

const SYS_USER = 'sys_user'
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

const adminUser = {
  'username': 'admin',
  'password': 'P4ssword',
  'prename': '1',
  'fname': 'admin',
  'lname': 'admin',
  'inactive': 0,
}
const adminCredentials = {
  username: adminUser.username,
  password: adminUser.password,
}

const roleUser = { name: 'user' }
const roleAdmin = { name: 'admin' }

const addUser = async (user = { ...activeUser }) => {
  user.password = await bcrypt.hashSync(user.password)
  return await db(SYS_USER).insert(user)
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

const app = build()

describe('User Delete', () => {
  beforeEach(async () => {
    await db(SYS_USER).truncate()
    await db(SYS_ROLE).truncate()
    await db(SYS_USER_ROLE).truncate()
  })

  it('return 401 when request sent unauthorized', async () => {
    const response = await app.inject({
      url: `/api/users/1`,
      method: 'delete',
    })
    expect(response.statusCode).toBe(401)
  })

  it('return 403 เมื่อ request จาก user ที่ไม่มี role admin', async () => {
    // Arrange
    const userId = await addUser(activeUser)
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
      url: `/api/users/1`,
      method: 'delete',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
    })

    // Assert
    expect(response.statusCode).toBe(403)
  })

  it('return 200 เมื่อ request จาก user ที่มี role admin', async () => {
    // Arrange
    const adminId = await addUser(adminUser)
    const userId = await addUser(activeUser)
    await addRole([roleUser, roleAdmin])
    const rolesInDb = await db(SYS_ROLE).select()
    const userRoles = rolesInDb.map(role => {
      return {
        user_id: adminId[0], role_id: role.id,
      }
    })
    await addUserRole(userRoles)
    const responseJwt = await postAuthentication(adminCredentials)

    // Act
    const response = await app.inject({
      url: `/api/users/${userId[0]}`,
      method: 'delete',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
    })

    // Assert
    expect(response.statusCode).toBe(200)
  })
})

