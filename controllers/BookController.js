const express = require('express')
const BookModel = require('../models/BookModel')
const bodyParser = require('body-parser')
const { sendTelegramNotification } = require('../utils/telegramUtils')

const {
  validateName,
  validateAuthor,
  validatePublishYear,
  validatePagesCount,
  validatePrice,
} = require('../utils/validationUtils')

const {
  filterBooksByPriceRange,
  filterBooksBySearch,
  sortBooks,
} = require('../utils/bookUtils')

const router = express.Router()
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const telegramBotToken = 'TOKEN'
const chatId = 'CHAT ID'

router.get('/books', async (req, res) => {
  try {
    let books

    const { minPrice, maxPrice, search, sortBy, sortOrder } = req.query

    if (minPrice !== undefined && maxPrice !== undefined) {
      books = await filterBooksByPriceRange(
        parseFloat(minPrice),
        parseFloat(maxPrice),
      )
    } else {
      books = await BookModel.getAllBooks()
    }

    if (search !== undefined) {
      const searchTerm = search.toLowerCase()
      books = filterBooksBySearch(books, searchTerm)
    }

    if (sortBy !== undefined && sortOrder !== undefined) {
      books = sortBooks(books, sortBy, sortOrder)
    }

    res.json({ success: true, data: books })
  } catch (error) {
    console.error('Error fetching books:', error.message)
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    })
  }
})

router.get('/books/paginated', async (req, res) => {
  try {
    let books

    // check if minPrice and maxPrice query parameters are provided
    if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined) {
      const minPrice = parseFloat(req.query.minPrice)
      const maxPrice = parseFloat(req.query.maxPrice)

      // check if both minPrice and maxPrice are valid numbers
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        books = await BookModel.getBooksByPriceRange(minPrice, maxPrice)
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid minPrice or maxPrice values',
        })
      }
    } else {
      // if no minPrice and maxPrice provided, fetch all books
      books = await BookModel.getAllBooks()
    }

    // check if search query parameter is provided
    if (req.query.search !== undefined) {
      const searchTerm = req.query.search.toLowerCase()

      // apply search filter based on the provided search term
      books = books.filter(
        (book) =>
          book.name.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm),
      )
    }

    // check if sortBy and sortOrder query parameters are provided
    if (req.query.sortBy !== undefined && req.query.sortOrder !== undefined) {
      const sortBy = req.query.sortBy
      const sortOrder = req.query.sortOrder.toLowerCase() // ensure lowercase for comparison

      // check if sortOrder is valid
      if (sortOrder === 'asc' || sortOrder === 'desc') {
        // apply sorting based on the provided parameters
        books = books.sort((a, b) => {
          const aValue = a[sortBy]
          const bValue = b[sortBy]

          // compare the values based on sortOrder
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
      } else {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid sortOrder value' })
      }
    }

    // check if page and pageSize query parameters are provided
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10

    // calculate the start and end indices for pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    // get the books for the current page
    const paginatedBooks = books.slice(startIndex, endIndex)

    res.json({
      pageInfo: { page, pageSize, totalItems: books.length },
      success: true,
      data: paginatedBooks,
    })
  } catch (error) {
    console.error('Error fetching paginated books:', error.message)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

router.get('/books/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (!isNaN(id)) {
      const book = await BookModel.getBookByID(id)

      if (book) {
        res.json({ success: true, data: book })
      } else {
        res
          .status(404)
          .json({ success: false, message: 'Book not found for the given ID' })
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid book ID' })
    }
  } catch (error) {
    console.error('Error fetching book by ID:', error.message)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

router.post('/books/add', async (req, res) => {
  const newBookData = req.body

  if (isValid(newBookData)) {
    try {
      const insertedId = await BookModel.createBook(newBookData)

      const telegramMessage = `New book added!\nTitle: ${newBookData.name}\nAuthor: ${newBookData.author}\nPrice: ${newBookData.price}`

      await sendTelegramNotification(telegramBotToken, chatId, telegramMessage)

      res.status(201).json({
        success: true,
        message: `Book with ID ${insertedId} added successfully.`,
      })
    } catch (error) {
      console.error('Error adding book to the database:', error)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid book data' })
  }
})

router.put('/books/update/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid book ID' })
    }

    const updatedBookData = req.body

    if (!isValid(updatedBookData)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid book data for update' })
    }

    const isUpdated = await BookModel.updateBookByID(id, updatedBookData)

    if (isUpdated) {
      res.json({
        success: true,
        message: `Book with ID ${id} updated successfully.`,
      })
    } else {
      res
        .status(404)
        .json({ success: false, message: 'Book not found for the given ID' })
    }
  } catch (error) {
    console.error('Error updating book by ID:', error.message)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

router.delete('/books/delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid book ID' })
    }

    const isDeleted = await BookModel.deleteBookByID(id)

    if (isDeleted) {
      res.json({
        success: true,
        message: `Book with ID ${id} deleted successfully.`,
      })
    } else {
      res
        .status(404)
        .json({ success: false, message: 'Book not found for the given ID' })
    }
  } catch (error) {
    console.error('Error deleting book by ID:', error.message)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

function isValid(newBookData) {
  return (
    validateName(newBookData.name) &&
    validateAuthor(newBookData.author) &&
    validatePublishYear(newBookData.publish_year) &&
    validatePagesCount(newBookData.pages_count) &&
    validatePrice(newBookData.price)
  )
}

module.exports = router
