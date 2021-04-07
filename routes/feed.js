const express = require('express')
const { body } = require('express-validator')

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts)

// POST /feed/post
router.post('/post', isAuth, [
    body('title', 'Must be at least 5 characters long').trim().isLength({ min: 5 }),
    body('content', 'Must be at least 7 characters long').trim().isLength({ min: 7 })
], feedController.createPost)

router.get('/post/:postId', isAuth, feedController.getPost)

router.put('/post/:postId', isAuth, [
    body('title', 'Must be at least 5 characters long').trim().isLength({ min: 5 }),
    body('content', 'Must be at least 7 characters long').trim().isLength({ min: 7 })
], feedController.updatePost)

router.delete('/post/:postId', isAuth, feedController.deletePost)
module.exports = router