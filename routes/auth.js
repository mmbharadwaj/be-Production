const AuthRouter = require("express").Router()
const { UserModel } = require("../models/User")
const { AdminModel } = require("../models/Admin")
const Joi = require('joi')
const bcrypt = require('bcrypt')


AuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { error } = validate(req.body)
    if (error) {
      return res.status(400).send({ Message: error.details[0].message })
    }
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(401).send({ Message: "No user found with this Email" })
    }
    const validPassword = await bcrypt.compare(
      password, user.password
    )
    if (!validPassword) {
      return res.status(400).send({ Message: "Invalid Password" })
    }
    const token = user.generateAuthToken();
    return res.status(200).send({ data: token, Message: "Logged in successfully" })
  } catch (err) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})

AuthRouter.post('/admin-login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { error } = validate(req.body)
    if (error) {
      return res.status(400).send({ Message: error.details[0].message })
    }
    const user = await AdminModel.findOne({ email })
    if (!user) {
      return res.status(401).send({ Message: "You are not admin" })
    }
    const validatePassword = await bcrypt.compare(
      password, user.password
    )
    if (!validatePassword) {
      return res.status(400).send({ Message: "Invalid Password" })
    }
    const token = user.generateAuthToken();
    return res.status(200).send({ data: token, Message: "Logged in successfully" })
  } catch (err) {
    return res.status(500).send({ Message: "Internal Server Error" })
  }
})

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().required().label("password")
  })
  return schema.validate(data)
}

module.exports = AuthRouter