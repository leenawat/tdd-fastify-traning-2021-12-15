import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'

const app = build()
const TABLE_NAME = 'sys_user'
const credentials = { username: 'user1', password: 'P4ssword' }
// const activeUser = {
//   'username': 'user',
//   'password': 'P4ssword',
//   'prename': '1',
//   'fname': 'user',
//   'lname': 'Papahom',
//   'inactive': 0,
// }

const addUser = async (count = 10) => {
  for (let i = 0; i < count; i++) {
    const hash = await bcrypt.hashSync('P4ssword')
    await db(TABLE_NAME).insert({
      username: `user${i + 1}`,
      password: hash,
      prename: '1',
      fname: 'fname' + (i + 1),
      lname: 'lname' + (i + 1),
      inactive: 0,
    })
  }
}

const postAuthentication = async (credentials) => {
  return await app.inject({
    url: '/api/auth',
    method: 'post',
    payload: credentials,
  })
}

const getUsers = async (options = {}) => {
  const response = await postAuthentication(options)
  return await app.inject({
    url: '/api/users',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + response.json().token,
    },
  })
}

describe('Listing Users', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
  })

  it('returns 200 when credentials are correct', async () => {
    await addUser()
    const response = await getUsers(credentials)
    expect(response.statusCode).toBe(200)
  })

  it('returns 401 when request wihtout Authorization header', async () => {
    const response = await app.inject({
      url: '/api/users',
      method: 'get',
    })
    expect(response.statusCode).toBe(401)
  })

  it('returns page object as response body', async () => {
    await addUser(1)
    const response = await getUsers(credentials)
    expect(Object.keys(response.json())).toEqual(['content', 'page', 'size', 'totalPages'])
  })
})
