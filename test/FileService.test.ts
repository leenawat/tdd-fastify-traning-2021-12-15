import { createFolders } from '../src/FileService'

const fs = require('fs')
const config = require('config')

const uploadDir = config.get('upload-dir')

describe('createFolders', () => {
  beforeEach(async () => {
    if (fs.existsSync(uploadDir)) {
      fs.unlinkSync(uploadDir)
    }
  })

  it('creates upload folder', () => {
    createFolders()
    expect(fs.existsSync(uploadDir)).toBe(true)
  })
})
