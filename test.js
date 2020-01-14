const path = require('path')
const fs = require('fs-extra')
const CSS = require('css')
const { validDomainId } = require('./routes/utils')
const hasFlag = require('has-flag')

function report (content, fix) {
  console.error(content)
  if (fix && hasFlag('--fix')) fix()
  process.exitCode = 1
}

(async () => {
  const users = await fs.readdir('users')
  users.forEach(async user => {
    if (!user.endsWith('json')) {
      report(`${user} is not a json file`, () =>
        fs.unlink(path.join('users', user), () => { })
      )
    }
    if (!validDomainId(user.replace('.json', ''))) {
      report(`${user} is not a valid domain id.`)
    }
    try {
      const data = await fs.readFile(path.join('users', user), 'utf8')
      try {
        const u = JSON.parse(data)
        if (!u.locked && !u.copyright) {
          report(`Copyright not specified in ${user}`)
        }
        if (u.version) {
          report(`Version tag found in ${user}`, () => {
            delete u.version
            const stringified = `${JSON.stringify(u, 0, 2)}\n`
            fs.writeFile(path.join('users', user), stringified, () => { })
          })
        }
        if (typeof u.gravatar === 'string') {
          report(`Gravatar boolean encoded as string found in ${user}`, () => {
            u.gravatar = u.gravatar === 'true'
            const stringified = `${JSON.stringify(u, 0, 2)}\n`
            fs.writeFile(path.join('users', user), stringified, () => { })
          })
        }
      } catch ({ message }) {
        report(`Invalid JSON in ${user} (${message})`)
      }
    } catch ({ message }) {
      report(`Unable to read ${user} (${message})`)
    }
  })

  const themes = await fs.readdir('themes')
  await themes.forEach(async theme => {
    if (theme.endsWith('css')) {
      try {
        const data = await fs.readFile(path.join('themes', theme), 'utf8')
        try {
          CSS.parse(data)
        } catch ({ message }) {
          report(`Invalid CSS in ${theme} (${message})`)
        }
      } catch ({ message }) {
        report(`Unable to read ${theme} (${message})`)
      }
    }
  })
})()
