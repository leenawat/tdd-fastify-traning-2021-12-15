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

  it(`returns "username in use" when same username is already in use`, async () => {
    await db(TABLE_NAME).insert({ ...validUser })
    const response = await postUserRegister()
    expect(response.json().message).toBe('username in use')
  })

  it('creates user in inactive mode', async () => {
    await postUserRegister()
    const users = await db(TABLE_NAME).select()
    const savedUser = users[0]
    expect(savedUser.inactive).toBe(1)
  })

  it('creates user in inactive mode even the request body contains inactive as false', async () => {
    const newUser = { ...validUser, inactive: 0 }
    await postUserRegister(newUser)
    const users = await db(TABLE_NAME).select()
    const savedUser = users[0]
    expect(savedUser.inactive).toBe(1)
  })
})

