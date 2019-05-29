import express = require('express');
import * as path from 'path'
import * as fs from 'fs'
const PORT = process.env.PORT || 80
import compression = require('compression');
import md5 = require('md5');
import humanizeList from 'humanize-list'
import minify = require('express-minify')
const ejs = require('ejs')
import {yearNow, stripTags, trimArray} from './util'
const HTML = require('node-html-parser')

// Prepare application
const app = express()
app.use(compression())
app.use(minify({
    cache: require('tmp').dirSync().name,
}))
app.set('view engine', 'ejs')

// Setup static files
app.use('/themes', express.static('themes'))
app.use('/users', express.static('users'))
app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'))

// Allow CORS
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

// HTTP POST API
app.post('/', (_req, res) => {
    res.end()
})

// Any other HTTP GET request
app.get('*', (req, res) => {
    // Get user id (example: 'rem.mit-license.org/@2019' -> 'rem')
    const id = req.hostname.split('.')[0]

    // Get params (example: 'rem.mit-license.org/@2019' -> ['@2019'])
    const params = req.path.split('/')
    params.shift()

    // Load the user data (example: from 'rem.mit-license.org/@2019' -> 'users/rem.json')
    fs.readFile(path.join('users', `${id}.json`), 'utf8', (err, data: string) => {
        let name: string; let theme: string; let gravatar: string
        const user = JSON.parse(data || '{}')
        // If error opening
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                name = '<copyright holders>'
                theme = 'default'
                gravatar = ''
            } else {
                // Other error
                res.status(500).end()
                return
            }
        } else {
            // No error
            name = typeof user.copyright === 'string' ? user.copyright : humanizeList(user.copyright)
            theme = user.theme || 'default'
            gravatar = user.gravatar ? `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}" />` : ''
        }

        const year = (() => {
            // rem.mit-license.org/@2019
            const customYear = params.find((val) => val.startsWith('@'))

            // rem.mit-license.org/2019
            const fromYear = params.find((val) => !isNaN(parseInt(val.replace('-', ''))))

            // If current year
            if (customYear) return customYear.replace(/[@-]/g, '')

            // If from year
            if (fromYear) {
                // If from year is same as current
                if (parseInt(fromYear) === yearNow) return yearNow

                return `${fromYear.replace('-', '')}-${yearNow.toString().replace('-', '')}`
            }

            return yearNow
        })()

        const customLicense = params.find((val) => val.startsWith('+'))
        const license = customLicense ? customLicense.replace('+', '') : user.license || 'MIT'

        const format = params.find((val) => val === 'license.html') ? 'html' : params.find((val) => val === 'license.txt') ? 'txt' : user.format || 'html'

        const args = {
            info: `${year} ${name}`,
            theme,
            gravatar,
        }

        if (format === 'html') res.render(path.join(__dirname, 'licenses', license), args)
        else {ejs.renderFile(path.join(__dirname, 'licenses', `${license}.ejs`), args, (_err: any, str: string) =>
            res
                .set('Content-Type', 'text/plain; charset=UTF-8')
                .send(
                    trimArray(
                        stripTags(HTML.parse(str).childNodes[0].childNodes[3].childNodes[1].toString())
                            .split('\n')
                            .map((val: string) => val.trim())
                    )
                        .join('\n')
                )
        )}
    })
})

// Start listening for HTTP requests
app.listen(PORT)
