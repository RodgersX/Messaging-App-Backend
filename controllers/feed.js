const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')

exports.getPosts = (req, res, next) => {
  Post.find().then(posts => {
    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts
    })
  }).catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.createPost = (req, res, next) => {
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
  post.save().then(result => {
    return User.findById(req.userId)
  }).then(user => {
    creator = user
    user.posts.push(post)
    return user.save()
  }).then(() => {
    res.status(201).json({
      message: 'Post created successfully',
      post: post,
      creator: { _id: creator._id, name: creator.name }
    })
  }).catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}


exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId).then(post => {
    if(!post) {
      const error = new Error('Could not find post!')
      error.statusCode = 404
      throw error
    }
    res.status(200).json({
      message: 'Post fetched',
      post: post
    })
  }).catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId

  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    const error = new Error('Invalid data entered')
    error.statusCode = 422
    throw error
  }

  const title = req.body.title
  const content = req.body.content
  
  Post.findById(postId).then(post => {
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

    return post.save()
  }).then(result => {
    res.status(200).json({
      message: 'Post updated',
      post: result
    })
  }).catch(err => { // executes the error handling middleware in app.js
    if(!err.statusCode) { // use next() instead of throw
      err.statusCode = 500
    }
    next(err)
  })
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId

  Post.findById(postId).then(post => {
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
    return Post.findByIdAndRemove(postId)
  }).then(() => {
    return User.findById(req.userId)
  }).then(user => {
    user.posts.pull(postId)
    return user.save()
  }).then(() => {
    res.status(200).json({
      message: 'Post deleted!'
    })
  }).catch(err => {
    if(!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  })

}