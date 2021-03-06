const path = require('path')
const fs = require('fs')

const { TEMPLATE_DIR } = require('../constants')

const errorPage = fs.readFileSync(path.join(TEMPLATE_DIR, 'error-message.html')).toString()

function ErrorHandler (res, err) {
  res.set('Content-Type', 'text/html')
  const info = errorPage.replace('{err.message}', err.message)
  res.status(400).send(info)
}

module.exports.ErrorHandler = ErrorHandler
