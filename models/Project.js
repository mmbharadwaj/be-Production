const mongoose = require('mongoose')
const Joi = require('joi')

const ProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userText: { type: String },
  video: { type: String, required: true },
  audio: { type: String, required: true },
  projectName: { type: String, required: true },
  videoId: { type: String, required: true },
  audioId: { type: String, required: true },
  videoSize: { type: Number, required: true },
  audioSize: { type: Number, required: true },
  resultUrl: { type: String }
}, {
  timestamps: true
})

const ProjectModel = mongoose.model("Project", ProjectSchema)

const validate = (data) => {
  const schema = Joi.object({
    video: Joi.string().required().label("video"),
    audio: Joi.string().required().label("audio"),
    projectName: Joi.string().required().label("projectName")
  }).unknown()
  return schema.validate(data)
}

module.exports = { ProjectModel, validate }