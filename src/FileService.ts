const fs = require('fs')
const config = require('config')

const uploadDir = config.get('upload-dir')

export const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
  }
}
