require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./connection');
const UserRouter = require('./routes/user');
const AuthRouter = require('./routes/auth');
const StudioRouter = require('./routes/studio')
const MonitorRouter = require('./routes/monitor')

//DB connection
connection()

//middleWares
app.use(express.json())
app.use(cors())

//routes
app.use("/api-nsai/", UserRouter)
app.use("/api-nsai/", AuthRouter)
app.use("/api-nsai/", StudioRouter)
app.use("/api-nsai/", MonitorRouter)

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server Running on ${port}`))