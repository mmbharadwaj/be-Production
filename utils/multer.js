const multer = require('multer')

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/) && !file.originalname.match(/\.(mp3|m4a|mpeg)$/)) {
      return cb(new Error("File type is not supported"), false)
    }
    cb(undefined, true)
  }
})

const uploadVideo = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv|mov|wmv|avi|mkv|webm)$/)) {
      return cb(new Error("File type is not supported"), false)
    }
    cb(undefined, true)
  }
})

const uploadAudio = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp3|m4a|mpeg|flac|wav|wma|aac)$/)) {
      return cb(new Error("File type is not supported"), false)
    }
    cb(undefined, true)
  }
})

module.exports = { upload, uploadVideo, uploadAudio }