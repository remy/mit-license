const express = require('express')
const path = require('path')
const fs = require('fs')
const PORT = process.env.PORT || 80
const mustache = require('mustache')
const compression = require('compression')
const dayjs = require('dayjs')
const md5 = require('md5')

// Read License file
const template = fs.readFileSync('LICENSE.html', "utf8")
mustache.parse(template);

// Prepare application
const app = express()
app.use(compression())
app.use(require('express-res-html'))

// Setup useful variables
const year = dayjs().year()

// Any theme request
app.get('/themes/:file', (req, res) => res.sendFile(path.join(__dirname, 'themes', req.params.file)))

// Any user request
app.get('/users/:file', (req, res) => res.sendFile(path.join(__dirname, 'users', req.params.file)))

// Any other HTTP GET request
app.get('*', (req, res) => {
    // Get user id (example: 'rem.mit-license.org/@2019' -> 'rem')
    const id = req.hostname.split('.')[0]

    // Load the user data (example: from 'rem.mit-license.org/@2019' -> 'users/rem.json')
    fs.readFile(path.join('users', `${id}.json`), 'utf8', (err, data) => {
        // If error opening
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                info = `${year} <copyright holders>`
                theme = `default`
                gravatar = ``
            } else {
                // Other error
                res.status(500).end()
            }
        } else {
            // No error
            const user = JSON.parse(data)
            info = `${year} ${user.copyright}`
            theme = user.theme || "default"
            gravatar = user.gravatar ? `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}" />` : ``
        }

        // Parse the options specified in the URL
        res.set('Content-Type', 'text/html');
        res.send(new Buffer.from(mustache.render(template, {
            info,
            theme,
            gravatar
        })));
    });
})

// Start listening for HTTP requests
app.listen(PORT)
