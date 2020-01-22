const Post = require('../models/Posts')

const postExist = async (req, res, next) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    throw new Error('Can\'t upload to non-existing post')
  }
  req.post = post
  next()
}

module.exports = postExist