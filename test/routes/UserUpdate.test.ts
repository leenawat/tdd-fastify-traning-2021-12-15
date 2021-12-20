import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'

const app = build()
const TABLE_NAME = 'sys_user'
const credentials = { username: 'leenawat', password: 'P4ssword' }
const validUser = {
  'username': 'leenawat',
  'password': 'P4ssword',
  'prename': '1',
  'fname': 'Leenawat',
  'lname': 'Papahom',
  'inactive': 0,
}

const addUser = async (user = { ...validUser }) => {
  user.password = await bcrypt.hashSync(user.password)
  const result = await db(TABLE_NAME).insert(user)
  return result[0] // return id primary for table sys_user
}

const postAuthentication = async (credentials = {}) => {
  return await app.inject({
    url: '/api/auth',
    method: 'post',
    payload: credentials,
  })
}

describe('User Update', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
  })

  it('returns 401 when request without Authorization header', async () => {
    const userId = await addUser()
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      payload: {},
    })
    expect(response.statusCode).toBe(401)
  })

  it('returns 200 when request with Authorization header', async () => {
    const userId:any = await addUser()
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUser,
    })
    expect(response.statusCode).toBe(200)
  })

  it('returns \"Autorization header is missing!\" for unauthorization request', async () => {
    const response = await app.inject({
      url: '/api/users/5',
      method: 'put',
      payload: validUser,
    })
    expect(response.json().message).toBe('Autorization header is missing!')
  })

  it('returns 403 when update request is sent with correct credentials but for different user', async () => {
    await addUser()
    const userId2 = await addUser({ ...validUser, username: 'user2' })
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId2,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: {},
    })
    expect(response.statusCode).toBe(403)
  })

  it('returns 200 ok when valid update request sent from authorized user', async () => {
    const userId = await addUser()
    const validUpdate = { username: 'fname1-updated' }
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUpdate,
    })
    expect(response.statusCode).toBe(200)
  })

  it('reutrns 403 when token is not valid', async () => {
    const response = await app.inject({
      url: '/api/users/1',
      method: 'put',
      headers: {
        Authorization: 'Bearer x.y.z',
      },
      payload: {},
    })
    expect(response.statusCode).toBe(403)
  })
})
