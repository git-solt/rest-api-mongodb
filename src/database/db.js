const mongoose = require('mongoose')

const connectionString = process.env.DB_CONNECTION_STRING

mongoose.connect(connectionString, {
  useNewUrlParser:true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', () => {
  console.log('error when trying to connect')
})

db.once('open', () => {
  console.log('DB CONNECTED')
})

