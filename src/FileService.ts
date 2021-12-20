import path from 'path'

const fs = require('fs')
const config = require('config')

const uploadDir = config.get('upload-dir')
const profileDir = config.get('profile-dir')
const profileFolder = path.join('.', uploadDir, profileDir)

export const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
  }
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder)
  }
}
