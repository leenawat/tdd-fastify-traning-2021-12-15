import { createFolders } from '../src/FileService'

const fs = require('fs')
const path = require('path')
const config = require('config')

const uploadDir = config.get('upload-dir')
const profileDir = config.get('profile-dir')
const profileFolder = path.join('.', uploadDir, profileDir)

describe('createFolders', () => {
  it('creates upload folder', () => {
    createFolders()
    expect(fs.existsSync(uploadDir)).toBe(true)
  })
  it('creates profile folder under upload folder', () => {
    createFolders()
    expect(fs.existsSync(profileFolder)).toBe(true)
  })
})
