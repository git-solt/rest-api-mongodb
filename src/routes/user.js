const express = require('express')
const User = require('../models/User')
const router = express.Router()
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const validUpdateRequest = require('../utils/validateUpdateReq')

router.post('/register', async (req, res) => {
  const user = new User(req.body)
  try {

    await user.save()

    return res.send(user)


    
  } catch (error) {
    
    res.status(500).send({error})
    

  }
})

router.patch('/me', auth, async (req, res) => {
  const updates = validUpdateRequest(req, res)

  try {
    const user = await User.findOne({_id:req.user._id})

    updates.forEach((cur) => {
      user[cur] = req.body[cur]
    })

    await user.save()

    return res.status(200).send(user)
  } catch (error) {
    res.status(200).send('Unable to update')
  }
})


router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (error) {
    console.log({...req.body})
    res.status(400).send()
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(cur => cur.token !== req.token)
    console.log(req.token)
    await req.user.save()
    console.log(req.user.tokens)

    res.send()

  } catch (error) {
    console.log(req.user.tokens)
    console.log(req.token)
    res.status(400).send(error)
  }
})

router.post('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('Logged out on all devices')
  } catch (e) {
    res.status(500).send()
  }
})


router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({_id: req.user._id})

  console.log(user)
})



module.exports = router