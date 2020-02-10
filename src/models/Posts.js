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
  },

  images: [
    {
      buffer: {
        type: Buffer
      },
      contentType: String,
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
      }
    }
  ],

  pics: [
    {image: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }, layout: {
      type: String,
      default: 'fill',
      required: true
    }}
  ]

})



const Post = mongoose.model('Post', postSchema)

module.exports = Post