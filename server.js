/*
IMPORTANT:   Set the `github_token` environment variable to a personal access token
             with at least the `public_repo` scope for the API.

Server port: The `PORT` environment variable can also be set to control the port the server
             should be hosted on.
*/
const express = require('express')
const minify = require('express-minify')
const favicon = require('serve-favicon')
const postcssMiddleware = require('postcss-middleware')
const tempDirectory = require('temp-dir')
const path = require('path')

// Server
const PORT = process.env.PORT || 8080

// Prepare application
const app = express()
app.use(
  minify({
    cache: tempDirectory
  })
)
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.set('views', path.join(__dirname, '/licenses'))
app.set('view engine', 'ejs')

// Setup static files
app.use('/robots.txt', express.static('robots.txt'))
app.use('/favicon.ico', express.static(`${__dirname}/favicon.ico`))
app.use(
  '/themes',
  postcssMiddleware({
    plugins: [
      require('postcss-preset-env')({
        overrideBrowserslist: '>= 0%',
        stage: 0
      })
    ],
    src (req) {
      return path.join(__dirname, 'themes', req.path)
    }
  }),
  express.static('themes')
)

// Middleware

// CORS
app.use(require('cors')())
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(
  express.urlencoded({
    extended: true
  })
)
// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// Capture the id from the subdomain
app.use(require('./middleware/load-user'))
app.use(require('./middleware/load-options'))

// HTTP POST API
app.post('/', require('./routes/post'))
app.get('/*', require('./routes/get'))

// Start listening for HTTP requests
app.listen(PORT, () => {
  console.log(`🚀 on http://localhost:${PORT}`)
})
