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
})

