const mysql = require('mysql')
const dbConfig = require('../config/dbConfig.js')

const connection = mysql.createConnection(dbConfig)

connection.connect((err) => {
  if (err) {
    console.error('error connecting to the database:', err)
    throw err
  }
  console.log('connected!')
})
