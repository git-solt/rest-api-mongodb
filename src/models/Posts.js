const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim:true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  published: {
    type: Boolean,
    default: true, 
    required: true
  }, 

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

})



const Post = mongoose.model('Post', postSchema)

module.exports = Post