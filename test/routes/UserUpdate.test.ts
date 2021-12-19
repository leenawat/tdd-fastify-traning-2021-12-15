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
  return await db(TABLE_NAME).insert(user)
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
    const user:any = await addUser()
    const response = await app.inject({
      url: '/api/users/' + user.uid,
      method: 'put',
      payload: user,
    })
    expect(response.statusCode).toBe(401)
  })

  it('returns 200 when request with Authorization header', async () => {
    const user:any = await addUser()
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + user.uid,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: user,
    })
    expect(response.statusCode).toBe(200)
  })
})
