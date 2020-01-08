const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {


  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)


    // if (req.needToBeAdmin) {
    //   const user = await User.findOne({ _id: decoded._id, 'tokens.token': token, isAdmin: true })
    //   if (!user) {
    //     throw new Error('No user found')
    //   }
    //   req.token = token
    //   req.user = user

    // }

    const user = await (req.needToBeAdmin ? User.findOne({ _id: decoded._id, 'tokens.token': token, isAdmin: true}) : User.findOne({ _id: decoded._id, 'tokens.token': token}))


    if (!user) {
      throw new Error('No user found')
    }

    req.token = token
    req.user = user

    next()
  } catch (error) {
    console.log(error.message)
    res.status(401).send({ error: 'Please authenticate' })
  }
}



module.exports = auth