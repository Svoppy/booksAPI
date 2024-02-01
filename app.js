const express = require('express')
const BookController = require('./controllers/BookController')
const AuthorController = require('./controllers/AuthorController')

const app = express()
const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
  console.log('book api!')
  res.send('book api!')
})

// api route
app.use('/api', BookController, AuthorController)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
