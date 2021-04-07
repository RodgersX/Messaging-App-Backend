const express = require('express')
const { body } = require('express-validator')

const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.put('/signup', [
    body('email', 'Enter a valid email').isEmail().custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
            if(userDoc) {
                return Promise.reject('E-Mail address already exists')
            }
        })
    }).normalizeEmail(),
    body('password', 'Password should be more than 5 characters').trim().isLength({ min: 5 }),
    body('name', 'At least 5 characters long').trim().not().isEmpty()
], authController.signup)

router.post('/login', authController.login)

module.exports = router