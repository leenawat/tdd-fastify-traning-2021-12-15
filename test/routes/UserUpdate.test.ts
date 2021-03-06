import { build } from '../helper'
import db from '../../src/config/database'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const config = require('config')

const { uploadDir, profileDir } = config
const profileFolder = path.join('.', uploadDir, profileDir)

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

const readFileAsBase64 = (file = 'test-png.png') => {
  const filePath = path.join('.', 'test', 'resources', file)
  return fs.readFileSync(filePath, { encoding: 'base64' })
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
    const validUpdate = { fname: 'fname1-updated' }
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: { ...validUpdate },
    })
    expect(response.statusCode).toBe(200)
  })

  it('returns \"Autorization header is missing!\" for unauthorization request', async () => {
    const response = await app.inject({
      url: '/api/users/5',
      method: 'put',
      payload: {},
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
    const validUpdate = { fname: 'fname1-updated' }
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

  it('saves the user image when update contains image as base64', async () => {
    // check from db
    const fileInBase64 = readFileAsBase64()
    const userId = await addUser()
    const validUpdate = { fname: 'user1-updated', image: fileInBase64 }
    const responseToken = await postAuthentication(credentials)
    await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUpdate,
    })

    const inDBUser:any = await db(TABLE_NAME).select().where({ uid: userId }).first()
    expect(inDBUser.image).toBeTruthy()
  })

  it('saves the user image to upload folder and stores filename in user when update has image', async () => {
    // check from folder
    const fileInBase64 = readFileAsBase64()
    const userId = await addUser()
    const validUpdate = { fname: 'user1-updated', image: fileInBase64 }
    const responseToken = await postAuthentication(credentials)
    await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUpdate,
    })

    const inDBUser:any = await db(TABLE_NAME).select().where({ uid: userId }).first()

    const profileImagePath = path.join(profileFolder, inDBUser.image)
    expect(fs.existsSync(profileImagePath)).toBe(true)
  })

  it('returns 413 when image size exceeds 2mb', async () => {
    const fileWithExceeding2MB = 'a'.repeat(1024 * 1024 * 2)
    const base64 = Buffer.from(fileWithExceeding2MB).toString('base64')
    const userId = await addUser()
    const validUpdate = { fname: 'user1-updated', image: base64 }
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUpdate,
    })
    expect(response.statusCode).toBe(413)
  })

  it('returns 200 when image size is exactly 2mb', async () => {
    const testPng = readFileAsBase64()
    const pngByte = Buffer.from(testPng, 'base64').length
    const twoMB = 1024 * 1024 * 2
    const filling = 'a'.repeat(twoMB - pngByte)
    const fillBase64 = Buffer.from(filling).toString('base64')

    const userId = await addUser()
    const validUpdate = { fname: 'user1-updated', image: testPng + fillBase64 }
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

  it.each`
  file              | status
  ${'test-gif.gif'} | ${413}
  ${'test-pdf.pdf'} | ${413}
  ${'test-txt.txt'} | ${413}
  ${'test-png.png'} | ${200}
  ${'test-jpg.jpg'} | ${200}
  `('returns $status when uploading $file as image', async ({ file, status }) => {
    const fileInBase64 = readFileAsBase64(file)
    const userId = await addUser()
    const validUpdate = { fname: 'user1-updated', image: fileInBase64 }
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: validUpdate,
    })

    expect(response.statusCode).toBe(status)
  })

  it('???????????? return 403 ??????????????? request body ?????? uid', async () => {
    const userId = await addUser()
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: { uid: 1 },
    })
    expect(response.statusCode).toBe(403)
  })

  it('???????????? return 403 ??????????????? request body ?????? inactive', async () => {
    const userId = await addUser()
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: { username: 'user1' },
    })
    expect(response.statusCode).toBe(403)
  })

  it('???????????? return 403 ??????????????? request body ?????? username', async () => {
    const userId = await addUser()
    const responseToken = await postAuthentication(credentials)
    const response = await app.inject({
      url: '/api/users/' + userId,
      method: 'put',
      headers: {
        Authorization: 'Bearer ' + responseToken.json().token,
      },
      payload: { inactive: 1 },
    })
    expect(response.statusCode).toBe(403)
  })
})
