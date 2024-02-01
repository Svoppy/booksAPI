// bookUtils.js

const BookModel = require('../models/BookModel')

async function filterBooksByPriceRange(minPrice, maxPrice) {
  if (isNaN(minPrice) || isNaN(maxPrice)) {
    throw new Error('Invalid minPrice or maxPrice values')
  }
  return await BookModel.getBooksByPriceRange(minPrice, maxPrice)
}

function filterBooksBySearch(books, searchTerm) {
  return books.filter(
    (book) =>
      book.name.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm),
  )
}

function sortBooks(books, sortBy, sortOrder) {
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new Error('Invalid sortOrder value')
  }

  return books.sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })
}

module.exports = {
  filterBooksByPriceRange,
  filterBooksBySearch,
  sortBooks,
}
