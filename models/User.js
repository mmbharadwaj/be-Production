const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const passwordComplexity = require("joi-password-complexity")

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  userStorage: { type: Number, required: true },
  usedSeconds: { type: Number, required: true }
}, {
  timestamps: true
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" })
  return token
}

const UserModel = mongoose.model("User", userSchema)

const validate = (data) => {
  const schema = Joi.object({
    userName: Joi.string().required().label("userName"),
    email: Joi.string().required().label("email"),
    password: passwordComplexity().required().label("password"),
    userStorage: Joi.number().required().label("userStorage"),
    usedSeconds: Joi.number().required().label("usedSeconds")
  })
  return schema.validate(data)
}

module.exports = { UserModel, validate }