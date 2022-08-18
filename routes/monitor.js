const MonitorRouter = require("express").Router()
const { UserModel } = require("../models/User")
const { ProjectModel } = require("../models/Project")
const { AdminModel } = require("../models/Admin")
const mongoose = require("mongoose")
const { middleware } = require("../middlewares/authentication")
const { default: axios } = require("axios")
const { json } = require("express")

MonitorRouter.use(middleware)

MonitorRouter.get('/monitor', async (req, res) => {
  try {
    const userId = res.locals.userId
    if (!userId) {
      return res.status(401).send({ Message: "Not Authorized" })
    }
    users = await UserModel.find().select('usedSeconds userName userStorage email')
    // console.log(users)
    let resBody = {}
    resBody.user = await UserModel.count()
    resBody.project = await ProjectModel.count()
    resBody.seconds = 0
    resBody.seconds = users.reduce((total, a) => total + a.usedSeconds, 0)
    resBody.users = users
    if (!resBody) {
      return res.status(401).send({ Message: "Cannot found the " })
    }
    return res.status(200).send({ Message: "Data found", data: resBody })
  } catch (err) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})

MonitorRouter.get('/monitor/users/:id?', async (req, res) => {
  const { id } = req.params
  try {
    if (id) {
      const resBody = await UserModel.findOne({ _id: mongoose.Types.ObjectId(id) })
      if (!resBody) {
        return res.status(404).send({ Message: "User not found" })
      } else {
        return res.status(200).send({ Message: "User found", data: resBody })
      }
    } else {
      const resBody = await UserModel.find({})
      return res.status(200).send({ Message: "Data found", data: resBody })
    }
  } catch (err) {
    return res.status(500).send({ Message: "Internal server error" })
  }
})

MonitorRouter.get('/monitor/projects/:id?', async (req, res) => {
  const { id } = req.params
  try {
    if (id) {
      const resBody = await ProjectModel.findOne({ _id: mongoose.Types.ObjectId(id) })
      if (!resBody) {
        return res.status(404).send({ Message: "Project not found" })
      } else {
        return res.status(200).send({ Message: "Project found", data: resBody })
      }
    } else {
      const resBody = await ProjectModel.find({})
      return res.status(200).send({ Message: "Data found", data: resBody })
    }
  } catch (err) {
    return res.status(500).send({ Message: "Internal server error" })
  }
})

MonitorRouter.get('/monitor/projects/user/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    if (userId) {
      const resBody = await ProjectModel.find({ userId: userId })
      if (!resBody) {
        return res.status(404).send({ Message: "Project not found with this user" })
      } else {
        return res.status(200).send({ Message: "Projects found with User", data: resBody })
      }
    }
  } catch (err) {
    return res.status(500).send({ Message: "Internal server error" })
  }
})

MonitorRouter.post('/monitor/new-monitor', async (req, res) => {
  const { email, password } = req.body
  if (email && password) {
    try {
      axios.defaults.headers.common['token'] = res.locals.token
      const axiosResponse = await axios.post("http://localhost:5001/api-nsai/admin-signup", { email: "ramakrishnasiva128@gmail.com", password: "7981154363Ss@" })
      return res.status(axiosResponse?.status).send({ Message: axiosResponse?.data?.Message })
    }
    catch (err) {
      return res.status(500).send({ Message: err })
    }
  } else {
    return res.status(401).send({ Message: "Email or Password Missing" })
  }
})

module.exports = MonitorRouter