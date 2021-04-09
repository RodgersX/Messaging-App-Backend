const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require('./.env/index')

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()

app.use(bodyParser.urlencoded({ extended: true })) // x-www-form-urlencoded
app.use(bodyParser.json()) // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

// error handling middleware
app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({ 
        message: message, 
        data: data 
    })
})

mongoose.connect(config.MONGO_URI, { 
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('ULTRON GONE ROGUE!!')
    app.listen(config.PORT)
}).catch(err => console.log(err))
