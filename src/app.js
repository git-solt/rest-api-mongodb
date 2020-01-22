const express = require('express')
const userRouter = require('./routes/user')
const postRouter = require('./routes/posts')
const Post = require('./models/Posts')

const cors = require('cors')

const app = express()
const port = process.env.PORT

require('./database/db')
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/users', userRouter)
app.use('/posts', postRouter)

app.get('/', async (req, res) => {
  console.log('up')

  try {
    const post = await Post.findById('5e21eed36f8f7800171ae993')

    if (post === null) {
      throw new Error('No post')
    }
    console.log(post)
    return res.send(post.images[0].buffer)
  } catch (error) {
    console.log(error)
    res.send({error})
  }
  // res.send({request: 'ok'})
  // res.send(req.user) for auth middleware
})




app.listen(port, () => {
  console.log('Connected')
  console.log(`Serving port ${port}`)
})