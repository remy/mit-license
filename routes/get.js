import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {htmlEscape, htmlUnescape} from 'escape-goat'
import stripHtml from 'html-text'
import is from '@sindresorhus/is'
import getGravatarUrl from 'gravatar-url'
import createHtmlElement from 'create-html-element'
import {renderFile} from 'ejs'
import loadUser from '../lib/load-user.js'
import loadOptions from '../lib/load-options.js'

const directoryName = path.dirname(fileURLToPath(import.meta.url))

function getCopyrightName(user, isPlainText) {
  if (is.string(user)) {
    return user
  }

  const copyright = user.name || user.copyright

  return isPlainText ? copyright : htmlEscape(copyright)
}

function getCopyrightHtml(user, isPlainText) {
  const name = getCopyrightName(user, isPlainText)
  let html = user.url
    ? createHtmlElement({
      name: 'a',
      attributes: {
        href: user.url,
      },
      text: name,
    })
    : name

  if (user.email) {
    html += ` &lt;${createHtmlElement({
      name: 'a',
      attributes: {
        href: `mailto:${user.email}`,
      },
      text: user.email,
    })}&gt;`
  }

  return html
}

function getGravatarEmail(user) {
  if (user.gravatar && user.email) {
    // Supports regular format
    return user.email.trim().toLowerCase()
  }

  if (is.object(user.copyright[0]) && user.gravatar) {
    // Supports multi-user format
    return user.copyright[0].email.trim().toLowerCase()
  }
}

const removeFalsy = array => array.filter(Boolean)

export default async function getRoute(request, response) {
  let user
  try {
    user = await loadUser(request.hostname)
  } catch ({message}) {
    response
      .status(500)
      .send(`An internal error occurred - open an issue on https://github.com/remy/mit-license with the following information: ${message}`)
    return
  }

  const options = loadOptions(request.url)
  // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
  const year = options.pinnedYear
    ? options.pinnedYear
    : removeFalsy([options.startYear, options.endYear]).join('-')
  const license = (options.license || user.license).toUpperCase()
  const format = options.format || user.format
  const isPlainText = format !== 'html'

  let name

  // No error and valid
  if (user.copyright) {
    if (is.string(user.copyright)) {
      name = getCopyrightHtml(user, isPlainText)
    } else if (is.array(user.copyright) && user.copyright.every(value => is.string(value))) {
      // Supports: ['Remy Sharp', 'Richie Bendall']
      name = user.copyright.map(value => (isPlainText ? value : htmlEscape(value))).join(', ')
    } else {
      name = user.copyright.map(value => getCopyrightHtml(value)).join(', ')
    }
  }

  let gravatar
  const gravatarEmail = getGravatarEmail(user)

  if (gravatarEmail) {
    gravatar = createHtmlElement({
      name: 'img',
      attributes: {
        id: 'gravatar',
        alt: 'Profile image',
        src: getGravatarUrl(gravatarEmail),
      },
    })
  }

  try {
    const content = await renderFile(path.join(directoryName, '..', 'licenses', `${license}.ejs`), {
      info: `${year} ${name}`,
      theme: user.theme || 'default',
      gravatar,
    })

    if (format === 'txt') {
      const {articleContent} = content.match(/<article>(?<articleContent>.*)<\/article>/ms).groups

      response
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .send(htmlUnescape(stripHtml(articleContent)).trim())
      return
    }

    if (format === 'html') {
      response.send(content)
      return
    }

    response.json({...user, ...options})
  } catch (error) {
    response.status(500).send(error)
  }
}
