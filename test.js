import {promises as fs} from 'node:fs'
import process from 'node:process'
import {writeJsonFile} from 'write-json-file'
import {parse as parseCSS} from 'css'
import hasFlag from 'has-flag'
import getExtension from 'file-ext'
import path from 'path-extra'
import is from '@sindresorhus/is'
import isDomainId from './utils/is-domain-id.js'

async function report(content, fix) {
  console.error(content)
  if (fix && hasFlag('--fix')) {
    await fix()
  }

  process.exitCode = 1
}

const users = await fs.readdir('users')

for await (const user of users) {
  if (getExtension(user) !== 'json') {
    await report(`${user} is not a json file`, async () => {
      await fs.unlink(user)
    })
  }

  if (!isDomainId(path.base(user))) {
    await report(`${user} is not a valid domain id.`)
  }

  try {
    const data = await fs.readFile(path.join('users', user), 'utf8')

    try {
      const parsedData = JSON.parse(data)

      if (!parsedData.locked && !parsedData.copyright) {
        await report(`Copyright not specified in ${user}`)
      }

      if (parsedData.version) {
        await report(`Version tag found in ${user}`, async () => {
          delete parsedData.version
          await writeJsonFile(path.join('users', user), parsedData, {indent: 2})
        })
      }

      if (is.string(parsedData.gravatar)) {
        await report(`Gravatar boolean encoded as string found in ${user}`, async () => {
          parsedData.gravatar = parsedData.gravatar === 'true'
          const stringified = `${JSON.stringify(parsedData, 0, 2)}\n`
          await fs.writeFile(path.join('users', user), stringified)
        })
      }
    } catch ({message}) {
      await report(`Invalid JSON in ${user} (${message})`)
    }
  } catch ({message}) {
    await report(`Unable to read ${user} (${message})`)
  }
}

const themes = await fs.readdir('themes')

for await (const theme of themes) {
  if (getExtension(theme) === 'css') {
    try {
      const cssData = await fs.readFile(path.join('themes', theme), 'utf8')
      try {
        parseCSS(cssData)
      } catch ({message}) {
        await report(`Invalid CSS in ${theme} (${message})`)
      }
    } catch ({message}) {
      await report(`Unable to read ${theme} (${message})`)
    }
  }
}
