/*
IMPORTANT:   Set the `github_token` environment variable to a personal access token
             with at least the `public_repo` scope for the API.

Server port: The `PORT` environment variable can also be set to control the port the server
             should be hosted on.
*/

// Core
import * as path from 'path'
import * as fs from 'fs'

// Server
const PORT = process.env.PORT || 80
import express = require('express')
import compression = require('compression')
import minify = require('express-minify')
import postcssMiddleware = require('postcss-middleware')

// License viewing
import * as ejs from 'ejs'
import {yearNow, stripTags, trimArray} from './util'
import * as HTML from 'node-html-parser'
import md5 = require('md5');
import humanizeList from 'humanize-list'

// License creation
import btoa = require('btoa')
import gitpull = require('git-pull')
const github = require('@octokit/rest')({
    // GitHub personal access token
    auth: process.env.github_token,

    // User agent with version from package.json
    userAgent: `mit-license v${require('./package.json').version}`,
})

// Prepare application
const app = express()
app.use(compression())
app.use(minify({
    cache: require('tmp').dirSync().name,
}))
app.set('view engine', 'ejs')

// Setup static files
app.use('/robots.txt', express.static('robots.txt'))
app.use('/users', express.static('users'))
app.use('/themes', postcssMiddleware({
    plugins: [require('postcss-preset-env')({browsers: '>= 0%', stage: 0})],
    src: (req) => path.join(__dirname, 'themes', req.path),
}))
app.use('/themes', express.static('themes'))
app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'))

// Allow CORS
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}))

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// HTTP POST API
app.post('/', (req, res) => {
    // Get differnet parts of hostname (example: remy.mit-license.org -> ['remy', 'mit-license', 'org'])
    const params = req.hostname.split('.')

    // If there isn't enough part of the hostname
    if (params.length < 2) res.status(400).send('Please specify a subdomain in the URL.')

    github.repos.createFile({
        owner: 'remy',
        repo: 'mit-license',
        path: `users/${params[0]}.json`,
        message: `Automated creation of user ${params[0]}.`,
        content: btoa(''),
        committer: {
            name: 'MIT License Bot',
            email: 'remy@leftlogic.com',
        },
    })

    gitpull(__dirname, (err: any, _consoleOutput: any) => {
        if (err) {
            res.status(502).end()
        } else {
            res.status(201).end()
        }
    })
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
            if (err.code !== 'ENOENT') {
                // Error is not "File not found"
                res.status(500).end()
                return
            }
        } else if (!user.locked && user.copyright) {
            // No error and valid
            name = (() => {
                if (typeof user.copyright === 'string') {
                    // Supports regular format
                    let template: string

                    if (user.url) template = `<a href="${user.url}">${user.copyright}</a>`
                    else template = user.copyright

                    if (user.email) template += ` &lt;<a href="mailto:${user.email}">${user.email}</a>&gt;`

                    return template
                } else if (user.copyright.every((val: any) => typeof val === 'string')) {
                    // Supports: ['Remy Sharp', 'Richie Bendall']
                    return humanizeList(user)
                } else {
                    /*
                    Supports:
                    [{
                        "name": "Remy Sharp, https://remysharp.com",
                        "url": "https://remysharp.com",
                        "email": "remy@remysharp.com"
                    },{
                        "name": "Richie Bendall, https://www.richie-bendall.ml",
                        "url": "https://www.richie-bendall.ml",
                        "email": "richiebendall@gmail.com",
                    }]
                    */
                    let template: string

                    return humanizeList(user.copyright.map((val) => {
                        if (val.url) template = `<a href="${val.url}">${val.name}</a>`
                        else template = val.copyright

                        if (val.email) template += ` &lt;<a href="mailto:${val.email}">${val.email}</a>&gt;`

                        return template
                    }))
                }
            })()

            theme = user.theme

            gravatar = (() => {
                if (user.gravatar && user.email) {
                    // Supports regular format
                    return `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}" />`
                }
                else if (typeof user.copyright[0] === 'object' && user.gravatar) {
                    // Supports mutli-user format
                    return `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(user.copyright[0].email.trim().toLowerCase())}" />`
                }
                else return ''
            })()
        }

        const year = (() => {
            // rem.mit-license.org/@2019
            const customYear = params.find((val) => val.startsWith('@'))

            // rem.mit-license.org/2019
            const fromYear = params.find((val) => !isNaN(parseInt(val.replace('-', ''))))

            // rem.mit-license.org/2018-2019
            const rangeYear = params.find((val) => val.split('-').length === 2)

            // If current year
            if (customYear) return customYear.replace(/[@-]/g, '')

            // If range year
            if (rangeYear) return rangeYear

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
            info: `${year} ${name || '&lt;copyright holders&gt;'}`,
            theme: theme || 'default',
            gravatar,
        }

        if (format === 'html') res.render(path.join(__dirname, 'licenses', license), args)
        else {
            ejs.renderFile(path.join(__dirname, 'licenses', `${license}.ejs`), args, (_err: any, str: string) =>
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
            )
        }
    })
})

// Start listening for HTTP requests
app.listen(PORT)
