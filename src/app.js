const express = require('express')
const userRouter = require('./routes/user')
const postRouter = require('./routes/posts')
const cors = require('cors')

const app = express()
const port = process.env.PORT

require('./database/db')
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/users', userRouter)
app.use('/posts', postRouter)


app.get('/', (req, res) => {
  console.log('up')

  
  res.send('ok')
  // res.send(req.user) for auth middleware
})




app.listen(port, () => {
  console.log('Connected')
  console.log(`Serving port ${port}`)
})