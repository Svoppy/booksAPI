const mysql = require('mysql')
const dbConfig = require('../config/dbConfig.js')

class AuthorModel {
  static async getAuthorsWithBooks() {
    const connection = mysql.createConnection(dbConfig)

    try {
      connection.connect()

      const query = `
            SELECT
                A.author_name,
                B.id AS book_id,
                B.name AS book_name,
                B.publish_year,
                B.pages_count,
                B.price
            FROM
                (SELECT DISTINCT author AS author_name FROM books) A
            LEFT JOIN
                books B ON A.author_name = B.author
        `

      const results = await this.querySQL(connection, query)

      const authorsWithBooks = {}

      results.forEach((row) => {
        const authorName = row.author_name
        const bookId = row.book_id
        const bookName = row.book_name
        const publishYear = row.publish_year
        const pagesCount = row.pages_count
        const price = row.price

        if (!authorsWithBooks[authorName]) {
          authorsWithBooks[authorName] = {
            author_name: authorName,
            books: [],
          }
        }

        authorsWithBooks[authorName].books.push({
          book_id: bookId,
          book_name: bookName,
          publish_year: publishYear,
          pages_count: pagesCount,
          price,
        })
      })

      return Object.values(authorsWithBooks)
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
}

module.exports = AuthorModel
