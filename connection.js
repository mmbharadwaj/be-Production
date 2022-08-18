const mongoose = require('mongoose')

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.DBCONN)
    console.log('Connected to DataBase')
  } catch (err) {
    console.log('Could not connect to db try checking err below')
    console.log(err)
  }
}