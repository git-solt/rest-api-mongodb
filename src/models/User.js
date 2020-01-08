const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Please provide a valid email')
      } 
    }
  },
  password: {
    type: String,
    trim: true,
    minlength: 6,
    validate(value) {
      const noGo = value.toLowerCase().includes('password'.toLowerCase())

      if (noGo) {
        throw new Error('Cannot include the word password')
      }
    }
  }, 
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
})

userSchema.methods.generateAuthToken = async function ()  {
  const user = this
  const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7d'})
  
  user.tokens = user.tokens.concat({token})

  await user.save()

  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({email})

  if (!user) {
    throw new Error('Unable to log in')
  }

  const isMatch = password === user.password

  if (!isMatch) {
    throw new Error('Unable to log in')
    
  }

  return user
}

const User = mongoose.model('User', userSchema)

module.exports = User