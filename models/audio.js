const mongoose = require('mongoose')
const Joi = require('joi')

const AudioSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  audio: { type: String, required: true },
  audioId: { type: String, required: true },
  audioSize: { type: Number, required: true },
}, {
  timestamps: true
})

const AudioModel = mongoose.model("audios", AudioSchema)

const validateAudio = (data) => {
  const schema = Joi.object({
    audio: Joi.string().required().label("audio"),
    userId: Joi.string().required().label("userId"),
    audioId: Joi.string().required().label("audioId"),
    audioSize: Joi.number().required().label("audioSize")
  }).unknown()
  return schema.validate(data)
}

module.exports = { AudioModel, validateAudio }