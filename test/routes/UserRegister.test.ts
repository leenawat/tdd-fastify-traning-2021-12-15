import { build } from '../helper'
import db from '../../src/config/database'
const app = build()

const validUser =
{
  'username': 'leenawat',
  'password': 'P4ssword',
  'prename': '1',
  'fname': 'Leenawat',
  'lname': 'Papahom',
}
const TABLE_NAME = 'sys_user'
const postUserRegister = async (user = { ...validUser }) => {
  return await app.inject({
    url: '/api/users',
    method: 'post',
    payload: user,
  })
}

describe('user tests', () => {
  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
  })

  it('returns 201 when register request is valid', async () => {
    const res = await postUserRegister()
    expect(res.statusCode).toBe(201)
  })

  it('returns "User created" when register request is valid', async () => {
    const response = await postUserRegister()
    expect(response.json().message).toBe('User created')
  })

  it('saves the user to database', async () => {
    await postUserRegister()
    const userList = await db(TABLE_NAME).select()
    expect(userList.length).toBe(1)
  })

  it('hashes the password in database', async () => {
    await postUserRegister()
    const userList = await db(TABLE_NAME).select()
    const savedUser = userList[0]
    expect(savedUser.password).not.toBe('P4ssword')
  })
})

