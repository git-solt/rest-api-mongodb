const isPublishedOrOwner = (req, res, next) => {
  if (!req.post.published && req.user._id.toString() !== req.post.owner.toString()) {
    throw new Error('You do not have these rights')
  }

  next()
}

module.exports =  isPublishedOrOwner