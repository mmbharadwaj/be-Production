const StudioRouter = require("express").Router()
const { UserModel } = require("../models/User")
const { ProjectModel, validate } = require("../models/Project")
const { upload } = require("../utils/multer")
const mongoose = require("mongoose")
const cloudinary = require("../utils/cloudinary")
const { lipsync } = require("../helpers/lipSync")
const Queue = require('bee-queue');
const { middleware } = require("../middlewares/authentication")

StudioRouter.use(middleware)

StudioRouter.get('/studio/:id?', async (req, res) => {
  const { id } = req.params
  try {
    if (id) {
      const resBody = await ProjectModel.findOne({ _id: mongoose.Types.ObjectId(id) })
      if (!resBody) {
        return res.status(404).send({ Message: "Id not found" })
      } else {
        return res.status(200).send({ data: resBody })
      }
    } else {
      const { userId = res.locals.userId } = req.body
      const resBody = await ProjectModel.find({ userId })
      if (!resBody) {
        return res.status(404).send({ Message: "User Id not found" })
      }
      return res.status(200).send({ data: resBody })
    }
  }
  catch (err) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})


StudioRouter.post('/studio', upload.fields([{ name: "video", maxCount: 1 }, { name: "audio", maxCount: 1 }]), async (req, res) => {
  const { userId = res.locals.userId, userText = "", resultUrl = "", projectName } = req.body
  try {
    const user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(userId) })
    if (!user) {
      return res.status(409).send({ Message: "Internal Token Missing" })
    }
    if (user.userStorage + req.files.video[0].size + req.files.audio[0].size > 52428800) {
      return res.status(400).send({ Message: `You storage limit is reached remaining mb ${52428800 - user.userStorage}` })
    }
    const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
      folder: "videos",
      resource_type: "video",
    })
    const audioResult = await cloudinary.uploader.upload(req.files.audio[0].path, {
      folder: "audios",
      resource_type: "raw",
    })
    await UserModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, { userStorage: user.userStorage + videoResult.bytes + audioResult.bytes })
    const bodyData = {
      userId: userId,
      userText: userText,
      video: videoResult.secure_url,
      audio: audioResult.secure_url,
      projectName: projectName ? projectName : user.userName,
      audioId: audioResult.public_id,
      videoId: videoResult.public_id,
      videoSize: videoResult.bytes,
      audioSize: audioResult.bytes,
      resultUrl: resultUrl,
    }
    const { error } = validate(bodyData)
    if (error) {
      return res.status(400).send({ Message: error.details[0].message })
    }
    let console_project = new ProjectModel({
      ...bodyData
    })
    console_project.save(async (err, result) => {
      if (err) {
        await cloudinary.uploader.destroy(bodyData.audioId, {
          folder: "audios",
          resource_type: "raw"
        })
        await cloudinary.uploader.destroy(bodyData.videoId, {
          folder: "videos",
          resource_type: "video"
        })
        return res.status(500).send({ Message: "Not able to save data into DB" })
      }
    })
    return res.status(201).send({ Message: `${projectName} Project Created Successfully` })
  }
  catch (error) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})

StudioRouter.post('/studio/video', upload.fields([{ name: "video", maxCount: 1 }]), async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(res.locals.userId) })
    if (!user) {
      return res.status(409).send({ Message: "Internal Token Missing Please login again" })
    }
    const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
      folder: "videos",
      resource_type: "video",
    })
    await UserModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(res.locals.userId) }, { userStorage: user.userStorage + videoResult.bytes})

  } catch (err) {

  }
})

StudioRouter.delete('/studio/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await ProjectModel.findOne({ _id: mongoose.Types.ObjectId(id) })
    if (!result) {
      return res.status(404).send({ Message: "Trying to delete unknown source" })
    }
    const audioResult = await cloudinary.uploader.destroy(result.audioId, {
      folder: "audios",
      resource_type: "raw"
    })
    if (!audioResult) {
      return res.status(301).send({ Message: "not able to Delete audio file" })
    }
    const videoResult = await cloudinary.uploader.destroy(result.videoId, {
      folder: "videos",
      resource_type: "video"
    })
    if (!videoResult) {
      return res.status(301).send({ Message: "not able to Delete video file" })
    }
    const user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(result.userId) })
    let storage = user.userStorage - result.audioSize - result.videoSize
    await UserModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, { userStorage: storage })
    await ProjectModel.deleteOne({ _id: mongoose.Types.ObjectId(id) })
    return res.status(200).send("file deleted")
  } catch (err) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})

StudioRouter.get('/studio/model/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await ProjectModel.findOne({ _id: mongoose.Types.ObjectId(id) })
    if (!result) {
      return res.status(404).send({ Message: "unknown project source" })
    }
    const user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(result.userId) })
    const options = {
      removeOnSuccess: true,
      redis: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        password: process.env.DB_PASS,
      },
    }
    console.log("job creation started")
    const lipQueue = new Queue(`lip-${result._id}`, options);
    const job = lipQueue.createJob({ audio: result.audio, video: result.video, _id: result._id, userId: result.userId });
    console.log("job created")
    job.save()

    lipQueue.on('job succeeded', (job, result) => {
      console.log("Success") // email here
      lipQueue.destroy().then(() => console.log('Queue was destroyed'));
    })

    // Process jobs from as many servers or processes as you like
    lipQueue.process(async function (job, done) {
      console.log("job went to model")
      let result = await lipsync(job.data.audio, job.data.video, job.data._id, job.data.userId)
      return done(null, result);
    });
    return res.status(200).send("Video will be sent to Registered Email")
  }
  catch {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})



module.exports = StudioRouter