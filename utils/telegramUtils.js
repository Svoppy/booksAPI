const axios = require('axios')

async function sendTelegramNotification(botToken, chatId, message) {
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

  const data = {
    chat_id: chatId,
    text: message,
  }

  try {
    const response = await axios.post(apiUrl, data)
    console.log('Telegram notification sent:', response.data)
  } catch (error) {
    console.error('Error sending Telegram notification:', error.message)
  }
}

module.exports = { sendTelegramNotification }
