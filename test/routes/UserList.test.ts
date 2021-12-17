import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'

const app = build()
const TABLE_NAME = 'sys_user'
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
})
