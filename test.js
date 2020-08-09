const { promises: fs } = require('fs')
const writeJsonFile = require('write-json-file')
const CSS = require('css')
const { validDomainId } = require('./routes/utils')
const hasFlag = require('has-flag')
const getExtension = require('file-ext')
const path = require('path-extra')
const is = require('@sindresorhus/is')

async function report (content, fix) {
  console.error(content)
  if (fix && hasFlag('--fix')) await fix()
  process.exitCode = 1
}

(async () => {
  const users = await fs.readdir('users')

  for (const user of users) {
    if (getExtension(user) !== 'json') {
      await report(`${user} is not a json file`, async () => {
        await fs.unlink(user)
      })
    }

    if (!validDomainId(path.base(user))) {
      await report(`${user} is not a valid domain id.`)
    }

    try {
      const data = await fs.readFile(path.join('users', user), 'utf8')

      try {
        const parsedData = JSON.parse(data)

        if (!parsedData.locked && !parsedData.copyright) {
          report(`Copyright not specified in ${user}`)
        }

        if (parsedData.version) {
          await report(`Version tag found in ${user}`, async () => {
            delete parsedData.version
            await writeJsonFile(path.join('users', user), parsedData, { indent: 2 })
          })
        }

        if (is.string(parsedData.gravatar)) {
          await report(`Gravatar boolean encoded as string found in ${user}`, async () => {
            parsedData.gravatar = parsedData.gravatar === 'true'
            const stringified = `${JSON.stringify(parsedData, 0, 2)}\n`
            await fs.writeFile(path.join('users', user), stringified)
          })
        }
      } catch ({ message }) {
        report(`Invalid JSON in ${user} (${message})`)
      }
    } catch ({ message }) {
      report(`Unable to read ${user} (${message})`)
    }
  }

  const themes = await fs.readdir('themes')

  for (const theme of themes) {
    if (getExtension(theme) === 'css') {
      try {
        const cssData = await fs.readFile(path.join('themes', theme), 'utf8')
        try {
          CSS.parse(cssData)
        } catch ({ message }) {
          report(`Invalid CSS in ${theme} (${message})`)
        }
      } catch ({ message }) {
        report(`Unable to read ${theme} (${message})`)
      }
    }
  }
})()
