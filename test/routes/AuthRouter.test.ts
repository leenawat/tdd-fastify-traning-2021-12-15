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

describe('Authentication', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
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
})
