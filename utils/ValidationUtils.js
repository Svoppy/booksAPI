const validateName = (name) =>
  typeof name === 'string' && name.length >= 2 && name.length <= 30
const validateAuthor = (author) =>
  typeof author === 'string' && author.length >= 2 && author.length <= 30
const validatePublishYear = (year) =>
  Number.isInteger(year) && year >= 1900 && year <= 2024
const validatePagesCount = (count) =>
  Number.isInteger(count) && count >= 3 && count <= 1300
const validatePrice = (price) =>
  typeof price === 'number' && price >= 0 && price <= 150000

module.exports = {
  validateName,
  validateAuthor,
  validatePublishYear,
  validatePagesCount,
  validatePrice,
}
