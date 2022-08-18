const mongoose = require('mongoose')
const Joi = require('joi')

const VideoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  video: { type: String, required: true },
  videoId: { type: String, required: true },
  videoSize: { type: Number, required: true },
}, {
  timestamps: true
})

const VideoModel = mongoose.model("videos", VideoSchema)

const validateVideo = (data) => {
  const schema = Joi.object({
    video: Joi.string().required().label("video"),
    userId: Joi.string().required().label("userId"),
    videoId: Joi.string().required().label("videoId"),
    videoSize: Joi.number().required().label("videoSize")
  }).unknown()
  return schema.validate(data)
}

module.exports = { VideoModel, validateVideo }