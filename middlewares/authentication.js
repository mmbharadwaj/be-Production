const jwt = require('jsonwebtoken')

function middleware(req, res, next) {
  const { token } = req.headers
  if (token !== null && token !== undefined) {
    try {
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      var userId = decoded._id
      res.locals.userId = userId
      res.locals.token = token
      next()
    }
    catch (err) {
      return res.status(401).send({ Message: "JWT expired please login again" })
    }
  } else {
    return res.status(401).send({ Message: "JWT missing please login" })
  }
}

module.exports = { middleware }