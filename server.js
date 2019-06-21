/*
IMPORTANT:   Set the `github_token` environment variable to a personal access token
             with at least the `public_repo` scope for the API.

Server port: The `PORT` environment variable can also be set to control the port the server
             should be hosted on.
*/
const express = require('express');
const minify = require('express-minify');
const postcssMiddleware = require('postcss-middleware');
const tmpdir = require('os').tmpdir();
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Server
var PORT = process.env.PORT || 8080;

// Prepare application
const app = express();
app.use(minify({
  cache: tmpdir
}));
app.set('views', path.join(__dirname, '/licenses'));
app.set('view engine', 'ejs');

// Setup static files
app.use('/robots.txt', express.static('robots.txt'));
app.use('/favicon.ico', express.static(`${__dirname}/favicon.ico`));
app.use(
  '/themes',
  postcssMiddleware({
    plugins: [
      require('postcss-preset-env')({
        overrideBrowserslist: 'last 2 versions',
        stage: 0,
      }),
    ],
    src(req) {
      return path.join(__dirname, 'themes', req.path);
    },
  }),
  express.static('themes')
);

// Middleware

// CORS
app.use(require('./middleware/cors'));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({
  extended: true
}));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Capture the id from the subdomain
app.use(require('./middleware/load-user'));
app.use(require('./middleware/load-options'));

// HTTP POST API
app.post('/', require('./routes/post'));
app.get('/*', require('./routes/get'));

// If the current process is the main one
if (cluster.isMaster) {
  // Create processes relative to amount of CPUs
  Array.from({
    length: numCPUs
  }, () => cluster.fork());

  // When worker closed
  cluster.on('exit', worker => {
    console.log(`❌ Worker ${worker.process.pid} died.`);
  });
} else {
  // Start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`🚀 on http://localhost:${PORT}`);
  });
}
