const express = require('express')
const AuthorModel = require('../models/AuthorModel')

const router = express.Router()

router.get('/authors', async (req, res) => {
  try {
    let authorsWithBooks = await AuthorModel.getAuthorsWithBooks()

    // check if name query parameter is provided for search
    if (req.query.name !== undefined) {
      const searchName = req.query.name.toLowerCase()

      // apply search filter based on the provided name
      authorsWithBooks = authorsWithBooks.filter((author) =>
        author.author_name.toLowerCase().includes(searchName),
      )
    }

    res.json({ success: true, data: authorsWithBooks })
  } catch (error) {
    console.error('Error fetching authors with books:', error.message)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

module.exports = router
