const path = require('path')
const loadJsonFile = require('load-json-file')

module.exports = async (request, response, next) => {
  response.locals.id = request.hostname.split('.')[0]

  if (request.method.toUpperCase() !== 'GET') {
    return next()
  }

  // Otherwise load up the user json file
  response.locals.user = {
    copyright: '<copyright holders>'
  }

  try {
    const userData = await loadJsonFile(path.join(__dirname, '..', 'users', `${response.locals.id}.json`))
    
    response.locals.user = {
      ...response.locals.user,
      ...userData
    }
  } catch ({ code, message }) {
    if (code !== 'ENOENT') {
      response
        .code(500)
        .send(
          `An internal error occurred - open an issue on https://github.com/remy/mit-license with the following information: ${message}`
        )
      return
    }
  }

  next()
}
