const express = require('express')
const Post = require('../models/Posts')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({published:true})
    console.log(posts[0].owner)


    // res.send(posts)
    return posts ? res.send(posts) : res.send([])
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/drafts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.user._id, published: false })
    console.log(req.user.userName)
    return posts ? res.send(posts) : res.send([])
  } catch (error) {
    res.status(500).send()
  }

})

router.patch('/:id', adminOnly, auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const validUpdates = ['content', 'title', 'published']
  const isValidUpdates = updates.every((cur) => validUpdates.includes(cur))

  if (!isValidUpdates) {
    return res.status(500).send('You can only update content, title and the published property')
  }

  try {
    const post = await Post.findOne({ _id: req.params.id, published: true })
    console.log(req.params.id)
    updates.forEach((cur) => {
      post[cur] = req.body[cur]

    })

    await post.save()

    res.send(post)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.patch('/drafts/:id', adminOnly, auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const validUpdates = ['title', 'content', 'published']
  const isValidUpdates = updates.every((cur) => validUpdates.includes(cur))

  if (!isValidUpdates) {
    return res.status(500).send('Can only update title, content and published property')
  }

  try {
    const post = await Post.findOne({ _id: req.params.id, published: false, owner: req.user._id })

    updates.forEach((cur) => {
      post[cur] = req.body[cur]
    })

    await post.save()

    return res.status(200).send(post)
  } catch (error) {
    res.status(500).send(error)
  }


})


router.post('/addpost', adminOnly, auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id
  })
  try {
    await post.save()

    res.send(post)
  } catch (error) {

    res.send({ error: 'Unable to create the post' })
  }
})

module.exports = router