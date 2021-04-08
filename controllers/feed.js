const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts
    })
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// async await works like then promises
// they return what a then block would return
// use a try catch blockt t0 handle errors
exports.createPost = async (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    const error = new Error('Invalid data entered')
    error.statusCode = 422
    throw error
  }
  const title = req.body.title
  const content = req.body.content

  // use let to create an uninitialized variable
  let creator

  // Create post in db
  const post = new Post({
    title: title,
    content: content,
    creator: req.userId,
  })

  try {
    await post.save()
    const user = await User.findById(req.userId)
      user.posts.push(post)
      await user.save()
      res.status(201).json({
        message: 'Post created successfully',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      })
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId
  const post = await Post.findById(postId)
  try {
    if(!post) {
      const error = new Error('Could not find post!')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Post fetched',
      post: post
    })
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId

  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    const error = new Error('Invalid data entered')
    error.statusCode = 422
    throw error
  }

  const title = req.body.title
  const content = req.body.content
   try {
    const post = await Post.findById(postId)
    if(!post) {
      const error = new Error('Could not find post!')
      error.statusCode = 404
      // stops executing and goes to the next catch block
      throw error
    }
    if(post.creator.toString() !== req.userId) {
      const error = new Error('Unauthorized operation!')
      error.statusCode = 403
      throw error
    }
    post.title = title
    post.content = content

    const result = await post.save()
    res.status(200).json({
      message: 'Post updated',
      post: result
    })
   } catch(err) { // executes the error handling middleware in app.js
    if(!err.statusCode) { // use next() instead of throw
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId)
    if(!post) {
      const error = new Error('Could not find post!')
      error.statusCode = 404
      // stops executing and goes to the next catch block
      throw error
    }
    if(post.creator.toString() !== req.userId) {
      const error = new Error('Unauthorized operation!')
      error.statusCode = 403
      throw error
    }
    // check logged in user
    await Post.findByIdAndRemove(postId)

    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()

    res.status(200).json({
      message: 'Post deleted!'
    })
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}