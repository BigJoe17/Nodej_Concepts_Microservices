

require('dotenv').config()
const express = require('express')
const {configureCors} = require('./corsConfig');
const { requestLogger, addTimeStamp } = require('./middleware/customMiddleware');
const app = express()

const PORT = process.env.PORT || 3000


app.use(requestLogger)
app.use(addTimeStamp)

app.use(configureCors())
app.use(express.json())

app.listen(PORT, ()=>{
    console.log(`Server is now running on port ${PORT}`)
})


