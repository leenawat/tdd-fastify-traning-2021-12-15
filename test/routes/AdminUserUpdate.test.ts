import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

const app = build()
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
  return await db(SYS_USER).insert({
    ...user,
    password: await bcrypt.hashSync(user.password),
  })
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
    await db(SYS_USER).truncate()
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

  it('return 200 เมื่อ change inactive โดย user มีทั้งสอง role(user, admin)', async () => {
    // Arrange
    const userId = await addUser()
    await addRole([roleAdmin, roleUser])
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

  it('ค่า inactive ใน database ถูกเปลี่ยนเมื่อ request ถูกต้อง', async () => {
    // Arrange
    const adminId = await addUser(adminUser)
    const userId = await addUser(activeUser)
    await addRole([roleAdmin, roleUser])
    const rolesInDb = await db(SYS_ROLE).select()
    const userRoles = rolesInDb.map(role => {
      return {
        user_id: adminId[0], role_id: role.id,
      }
    })
    await addUserRole(userRoles)
    const responseJwt = await postAuthentication(adminCredentials)

    // Act
    await app.inject({
      url: `/api/admin/users/${userId[0]}/inactive/1`,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
    })

    // Assert
    const user:any = await db(SYS_USER).select().where({ uid: userId[0] }).first()
    expect(user.inactive).toBe(1)
  })

  it('return 403 เมื่อ เพิ่ม user_role โดยที่ user ไม่มี role admin', async () => {
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
      url: `/api/admin/users/${userId[0]}/roles`,
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + responseJwt.json().token,
      },
    })

    // Assert
    expect(response.statusCode).toBe(403)
  })
})
