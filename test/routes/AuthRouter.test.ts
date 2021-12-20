import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

describe('Authentication', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
    await db(SYS_ROLE).truncate()
    await db(SYS_USER_ROLE).truncate()
  })

  it('returns 200 when credentials are correct', async () => {
    await addUser()
    const response = await postAuthentication(credentials)
    expect(response.statusCode).toBe(200)
  })

  it('returns 401 when user does not exist', async () => {
    const response = await postAuthentication(credentials)
    expect(response.statusCode).toBe(401)
  })

  it('returns 401 when password is wrong', async () => {
    await addUser()
    const response = await postAuthentication({ username: 'leenawat', password: 'password' })
    expect(response.statusCode).toBe(401)
  })

  it('returns \"Incorrect credentials\" when authentication fails', async () => {
    await addUser()
    const response = await postAuthentication({ username: 'leenawat', password: 'password' })
    expect(response.json().message).toBe('Incorrect credentials')
  })

  it('returns uid, username and token when login success', async () => {
    const id:any = await addUser()
    const response = await postAuthentication(credentials)
    expect(response.json().uid).toBe(id[0])
    expect(response.json().username).toBe(activeUser.username)
    expect(Object.keys(response.json())).toEqual(['uid', 'username', 'token'])
  })

  it('returns valid token when login success', async () => {
    await addUser()
    const response = await postAuthentication(credentials)
    const decoded = jwt.decode(response.json().token)
    expect(decoded).not.toBeNull()
  })

  it('decoded token มี key ชื่อว่า \"exp\"', async () => {
    await addUser()
    const response = await postAuthentication(credentials)
    const decoded = jwt.decode(response.json().token)
    expect('exp' in decoded).toBeTruthy()
  })

  it('returns 403 when logging in with an inactive account', async () => {
    await addUser({ ...activeUser, inactive: 1 })
    const response = await postAuthentication(credentials)
    expect(response.statusCode).toBe(403)
  })

  it('returns \"Account is inactive\" when authentication fails for inactive account', async () => {
    await addUser({ ...activeUser, inactive: 1 })
    const response = await postAuthentication(credentials)
    expect(response.json().message).toBe('Account is inactive')
  })

  it('returns 401 when username is not valid', async () => {
    const response = await postAuthentication({ password: 'P4ssword' })
    expect(response.statusCode).toBe(401)
  })

  it('returns 401 when password is not valid', async () => {
    const response = await postAuthentication({ username: 'leenawat' })
    expect(response.statusCode).toBe(401)
  })

  it('return "roles" in token when login success', async () => {
    await addUser()
    const response = await postAuthentication(credentials)
    const decoded = jwt.decode(response.json().token)
    expect('roles' in decoded).toBeTruthy()
  })

  it('roles in user token equal to sys_user_roles in database', async () => {
    const userId = await addUser()
    await addRole([{ name: 'admin' }, { name: 'user' }, { name: 'customer' }])
    const rolesInDb = await db(SYS_ROLE).select()
    const userRoles = rolesInDb.map(role => {
      return {
        user_id: userId[0], role_id: role.id,
      }
    })
    const rolesName = rolesInDb.map(role => role.name)
    await addUserRole(userRoles)
    const response = await postAuthentication(credentials)
    const decoded = jwt.decode(response.json().token)

    // size equal and data equal
    const result = decoded.roles.length === rolesName.length &&
    decoded.roles.every(function (element) {
      return rolesName.includes(element)
    })
    expect(result).toBeTruthy()
  })
})
