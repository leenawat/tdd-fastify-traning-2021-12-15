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

const getUsers = async (options = {}, opts:any = {}) => {
  const response = await postAuthentication(options)
  const query = opts.query
  return await app.inject({
    url: '/api/users',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + response.json().token,
    },
    query,
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

  it('returns 10 users in page content when there are 11 users in database', async () => {
    await addUser(11)
    const response = await getUsers(credentials)
    expect(response.json().content.length).toBe(10)
  })

  it('returns 2 as totalPages when there are 11 users', async () => {
    await addUser(11)
    const response = await getUsers(credentials)
    expect(response.json().totalPages).toBe(2)
  })

  it('returns second page users and page indicator when page is set as 1 in request parameter', async () => {
    await addUser(11)
    const response = await getUsers(credentials, { query: { page: 1 } })
    expect(response.json().content[0].username).toBe('user11')
    expect(response.json().page).toBe(1)
  })

  it('return "querystring/page ต้องมีค่ามากกว่า หรือเท่ากับ 0" when page is set below zero as request parameter', async () => {
    await addUser(11)
    const response = await getUsers(credentials, { query: { page: -1 } })
    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('querystring/page ต้องมีค่ามากกว่า หรือเท่ากับ 0')
  })

  it('returns 5 users and corresponding size indicator when size is set as 5 in request parameter', async () => {
    await addUser(11)
    const response = await getUsers(credentials, { query: { size: 5 } })
    expect(response.json().content.length).toBe(5)
    expect(response.json().size).toBe(5)
  })

  it('returns "querystring/size should be <= 100" when size is set as 101 in request parameter', async () => {
    // limit size page to 100
    await addUser(11)
    const response = await getUsers(credentials, { query: { size: 101 } })
    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('querystring/size should be <= 100')
  })

  it('returns "querystring/size should be >= 1" when size is set below 1 as request parameter', async () => {
    await addUser(11)
    const response = await getUsers(credentials, { query: { size: 0 } })
    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('querystring/size should be >= 1')
  })

  it('returns "querystring/page should be number, querystring/size should be number" when page and size is not a number', async () => {
    await addUser(11)
    const response = await getUsers(credentials, { query: { page: 'a', size: 'b' } })
    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('querystring/page should be number, querystring/size should be number')
  })
})

describe('Get User', () => {
  let token = ''
  const getUser = async (id = 5) => {
    return await app.inject({
      url: '/api/users/' + id,
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
  }

  beforeEach(async () => {
    await db(TABLE_NAME).truncate()
    await addUser(1)
    const response = await postAuthentication(credentials)
    token = response.json().token
  })

  it('returns 204 when user not found', async() => {
    const response = await getUser()
    expect(response.statusCode).toBe(204)
  })

  fit('return 200 เมื่อพบ user ตาม id ที่ค้นหา', async () => {
    const response = await getUser(1)
    expect(response.statusCode).toBe(200)
  })
})
