import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const config = require('config')

const uploadDir = config.get('upload-dir')
const profileDir = config.get('profile-dir')
const profileFolder = path.join('.', uploadDir, profileDir)

const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
  }
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder)
  }
}

const saveProfileImage = async (base64File) => {
  const filename = uuidv4()
  const filePath = path.join(profileFolder, filename)
  await fs.promises.writeFile(filePath, base64File, 'base64')
  return filename
}

export default {
  createFolders,
  saveProfileImage,
}
