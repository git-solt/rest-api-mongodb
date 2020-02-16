const imageInPost = (req, res, next) => {
    const image = req.post.pics.find(cur => cur.image.toString() === req.params.imageid.toString())

    if (!image) {
        throw new Error('No image to comment')
    }
    req.image = image
    next()
}

module.exports = imageInPost