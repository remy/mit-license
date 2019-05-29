import express from 'express'
import path from 'path'
import fs from 'fs'
const PORT = process.env.PORT || 80
import compression from 'compression'
import dayjs from 'dayjs'
import md5 from 'md5'
import humanizeList from 'humanize-list'
import minify from 'express-minify'
import isNumber from 'is-number'

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

// Setup useful variables
const yearNow = dayjs().year()

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
        let name: string, theme: string, gravatar: string
        const user = JSON.parse(data || "{}")
        // If error opening
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                name = "<copyright holders>"
                theme = 'default'
                gravatar = ''
            } else {
                // Other error
                res.status(500).end()
                return;
            }
        } else {
            // No error
            name = typeof user.copyright === 'string' ? user.copyright : humanizeList(user.copyright)
            theme = user.theme || 'default'
            gravatar = user.gravatar ? `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}" />` : ''
        }

        const year = (() => {
            // rem.mit-license.org/@2019
            const customYear = params.find(val => val.startsWith("@"))

            // rem.mit-license.org/2019
            const fromYear = params.find(val => !isNaN(parseInt(val.replace("-", ""))))

            // If current year
            if (customYear) return customYear.replace(/[@-]/g, "")

            // If from year
            if (fromYear) {
                // If from year is same as current
                if (parseInt(fromYear) === yearNow) return yearNow

                return `${fromYear.replace("-", "")}-${yearNow.toString().replace("-", "")}`
            }

            return yearNow
        })()

        const customLicense = params.find(val => val.startsWith("+"))
        const license = customLicense ? customLicense.replace("+", "") : user.license || `${"MIT"}.ejs`

        // Parse the options specified in the URL
        res.render(path.join(__dirname, 'licenses', license), {
            info: `${year} ${name}`,
            theme,
            gravatar,
        })
    })
})

// Start listening for HTTP requests
app.listen(PORT)
