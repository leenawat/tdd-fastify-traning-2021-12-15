import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import FileType from 'file-type'

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

const isLessThan2MB = (buffer) => {
  return buffer.length < 2 * 1024 * 1024
}

const isSupportedFileType = async (buffer) => {
  const type = await FileType.fromBuffer(buffer)
  return !type ? false : type.mime === 'image/png' || type.mime === 'image/jpeg'
}

export default {
  createFolders,
  saveProfileImage,
  isLessThan2MB,
  isSupportedFileType,
}
