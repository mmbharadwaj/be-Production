const UserRouter = require("express").Router()
const { UserModel, validate, } = require("../models/User")
const bcrypt = require('bcrypt')
const { AdminModel } = require("../models/Admin")

UserRouter.post('/signup', async (req, res) => {
  const { userName, email, password } = req.body
  try {
    const bodyData = { ...req.body, userStorage: 0, usedSeconds: 0 }
    const { error } = validate(bodyData)
    if (error) {
      return res.status(400).send({ Message: error.details[0].message })
    }
    const user = await UserModel.findOne({ email })
    if (user) {
      return res.status(409).send({ Message: "User with given email already exists!" })
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(password, salt)
    await new UserModel({ userName, email, password: hashPassword, userStorage: 0, usedSeconds:0 }).save()
    res.status(201).send({ Message: `${email}, You can login now peacefully` })
  } catch (err) {
    res.status(500).send({ Message: "Internal Server Error", err })
  }
})

UserRouter.post('/admin-signup', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await AdminModel.findOne({ email })
    if (user) {
      return res.status(409).send({ Message: "User with given email already exists!" })
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(password, salt)
    await new AdminModel({ email, password: hashPassword }).save()
    res.status(201).send({ Message: `${email}, You can login now peacefully` })
  } catch (err) {
    res.status(500).send({ Message: "Internal Server Error", err })
  }
})

module.exports = UserRouter