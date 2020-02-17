const crypto = require('crypto')
const path = require('path')
const express = require('express')
const Post = require('../models/Posts')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')
const router = express.Router()
const postExist = require('../middleware/postExist')
const isPublishedOrOwner = require('../middleware/isPublishedOrOwner')


//File upload config
const multer = require('multer')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types.ObjectId
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')

const upload = multer({
  limits: 3000000,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})

let gfs

Grid.mongo = mongoose.mongo

const connectionString = process.env.DB_CONNECTION_STRING

const conn = mongoose.createConnection(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

conn.once('open', () => {
  console.log('Created connection')
  gfs = Grid(conn.db)
  gfs.collection('uploads')
})


const storage = new GridFsStorage({
  url: connectionString,
  file: (req, file) => {

    if (file.mimetype.match(/^image\/(jpg|jpeg|png)$/)) {


      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  }
});
const upload2 = multer({ storage });


//Fileupload-Config END



router.delete('/:id/deleteimage/:imageid', postExist, adminOnly, auth, async (req, res) => {
  const id = new ObjectId(req.params.imageid)



  try {

    await gfs.remove({ _id: id, root: 'uploads' })
    // // const removed = await gfs.files.findOne({_id: id})
    // req.post
    // return res.send('ok')
    req.post.pics = req.post.pics.filter(cur => cur.image.toString() !== id.toString())

    const post = await req.post.save()
    return res.send(post)
  } catch (error) {
    return res.status(404).send('Not removed')
  }

})

router.delete('/:id', postExist, adminOnly, auth, async (req, res) => {
  if (!req.post.published && req.user._id.toString() !== req.post.owner.toString()) {
    throw new Error('Only the creator of a draft can delete it')
  }

  try {
    await req.post.remove()
    req.post.pics.forEach(cur => {
      const id = new ObjectId(cur.image)
      gfs.remove({ _id: id, root: 'uploads' })
        .then(() => console.log('ok'))
        .catch(e => console.log(e))
    })

    return res.send({ removed: req.post })
  } catch (error) {
    res.status(500).send('cannot remove')
  }


})

router.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, published: true })
    if (!post) {
      return res.status(404).send('No post')
    }
    await post.populate('pics.descriptions')
        .execPopulate()
    return res.send(post)
  } catch (error) {
    return res.status(500).send({ error })
  }
})

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ published: true })

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


router.post('/:id', auth, upload.single('image'), async (req, res) => {

  const post = await Post.findOne({ _id: req.params.id })

  if (!post) {
    throw new Error('No post')
  }


  if (!req.file) {
    throw new Error('Please choose a file to upload')
  }
  // console.log(req.file.buffer)

  post.images = post.images.concat({ buffer: req.file.buffer, contentType: 'image/png', post: post.id })

  try {
    await post.save()
    res.send(post)
  } catch (error) {
    res.status(500).send()
  }
})




router.post('/image/:id', adminOnly, auth, postExist, isPublishedOrOwner, upload2.single('image'), async (req, res) => {



  const id = new ObjectId(req.file.id)

  try {
    const file = await gfs.files.findOne({ _id: id })

    if (!file) {
      return res.status(500).send('No file stored')

    }

    req.post.pics = req.post.pics.concat({ image: req.file.id })
    await req.post.save()
    res.send(req.post)

  } catch (error) {
    res.send('Unable to store')
  }



})

router.patch('/layout/:id/:imageid', adminOnly, auth, postExist, async (req, res) => {
  const enums = ['fill', 'cover', 'contain', 'scaledown']



  if (!req.body.layout) {
    throw new Error('No layout found')
  }

  const pass = enums.some(cur => cur === req.body.layout)


  if (!pass) {
    return res.status(500).send('Not a valid layout')
  }

  req.post.pics = req.post.pics.map((cur) => {
    if (cur.image.toString() === req.params.imageid.toString()) {

      return {
        _id: cur._id,
        image: cur.image,
        layout: req.body.layout,
        descriptions:cur.descriptions
      }
    } else {
      return cur
    }
  })





  try {
    await req.post.save()
    res.send(req.post)
  } catch (e) {
    res.status(500).send(e)
  }
})


router.get('/image/:id', (req, res) => {




  const id = new ObjectId(req.params.id)


  gfs.files.findOne({ _id: id })
    .then(file => {

      if (!file || file.length < 1) {
        return res.status(500).send('No file')
      }

      if (file.contentType.match(/^image\/(jpg|png|jpeg)$/)) {

        //Read output to browser
        const readstream = gfs.createReadStream(file)
        readstream.pipe(res)
      }
    })
    .catch(e => res.status(500).send('No file'))





})

module.exports = router