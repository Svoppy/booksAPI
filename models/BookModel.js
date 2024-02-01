const mysql = require('mysql')
const dbConfig = require('../config/dbConfig.js')

class BookModel {
  static async getAllBooks() {
    const connection = mysql.createConnection(dbConfig)

    try {
      const query = 'SELECT * FROM books'
      const books = await this.querySQL(connection, query)
      return books
    } finally {
      connection.end()
    }
  }

  static async createBook(newBook) {
    const connection = mysql.createConnection(dbConfig)

    return new Promise((resolve, reject) => {
      connection.connect()

      const sql =
        'INSERT INTO books (name, author, publish_year, pages_count, price) VALUES (?, ?, ?, ?, ?)'
      const values = [
        newBook.name,
        newBook.author,
        newBook.publish_year,
        newBook.pages_count,
        newBook.price,
      ]

      connection.query(sql, values, (error, results, fields) => {
        if (error) {
          reject(error)
        } else {
          resolve(results.insertId) // returns the ID of the inserted row
        }

        connection.end()
      })
    })
  }

  static async getBookByID(id) {
    const connection = mysql.createConnection(dbConfig)

    try {
      const query = 'SELECT * FROM books WHERE id = ?'
      const values = [id]

      const books = await this.querySQL(connection, query, values)
      return books.length > 0 ? books[0] : null
    } finally {
      connection.end()
    }
  }

  static async updateBookByID(id, updatedBookData) {
    const connection = mysql.createConnection(dbConfig)

    try {
      connection.connect()

      const query =
        'UPDATE books SET name = ?, author = ?, publish_year = ?, pages_count = ?, price = ? WHERE id = ?'
      const values = [
        updatedBookData.name,
        updatedBookData.author,
        updatedBookData.publish_year,
        updatedBookData.pages_count,
        updatedBookData.price,
        id,
      ]

      const result = await this.querySQL(connection, query, values)

      // Assuming result.affectedRows === 1 indicates success
      return result.affectedRows === 1
    } finally {
      connection.end()
    }
  }

  static async deleteBookByID(id) {
    const connection = mysql.createConnection(dbConfig)

    try {
      connection.connect()

      const query = 'DELETE FROM books WHERE id = ?'
      const values = [id]

      const result = await this.querySQL(connection, query, values)

      // Assuming result.affectedRows === 1 indicates success
      return result.affectedRows === 1
    } finally {
      connection.end()
    }
  }

  static async querySQL(connection, sql, values = []) {
    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
  }

  static async getBooksByPriceRange(minPrice, maxPrice) {
    const connection = mysql.createConnection(dbConfig)

    try {
      connection.connect()

      const query = `
              SELECT *
              FROM books
              WHERE price >= ? AND price <= ?
            `

      const values = [minPrice, maxPrice]

      const books = await this.querySQL(connection, query, values)
      return books
    } finally {
      connection.end()
    }
  }
}

module.exports = BookModel
