const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed!')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    
    try {
        const hashedPw = await bcrypt.hash(password, 12)
        const user = new User({
            name: name,
            email: email,
            password: hashedPw
        })
        const result = await user.save()
        res.status(201).json({
            message: "User created",
            userId: result._id
        })
    } catch(err) {
        if(!err.statusCode) { // use next() instead of throw
            err.statusCode = 500
        }
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    let loadedUser
    try {
        const user = await User.findOne({ email: email })
        if(!user) {
            const error = new Error('No user with the entered email!')
            error.statusCode = 404
            throw error
        }
        loadedUser = user
        const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual) {
            const error = new Error('Wrong password!')
            error.statusCode = 401
            throw error
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 
            'somesupersecretsecret', 
            { expiresIn: '1h' }
        )
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        })
    } catch(err) {
        if(!err.statusCode) { // use next() instead of throw
            err.statusCode = 500
        }
        next(err)
    }
}