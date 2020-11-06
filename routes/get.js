const path = require('path')
const { htmlEscape, htmlUnescape } = require('escape-goat')
const stripHtml = require('html-text')
const is = require('@sindresorhus/is')
const getGravatarUrl = require('gravatar-url')
const createHtmlElement = require('create-html-element')
const { renderFile } = require('ejs')

const getCopyrightName = (user, isPlainText) => {
  if (is.string(user)) {
    return user
  }

  const copyright = user.name || user.copyright

  return isPlainText ? copyright : htmlEscape(copyright)
}

const getCopyrightHtml = (user, isPlainText) => {
  const name = getCopyrightName(user, isPlainText)
  let html = user.url ? createHtmlElement({
    name: 'a',
    attributes: {
      href: user.url
    },
    text: name
  }) : name

  if (user.email) {
    html += ` &lt;${createHtmlElement({
      name: 'a',
      attributes: {
        href: `mailto:${user.email}`
      },
      text: user.email
    })}&gt;`
  }

  return html
}

const getGravatarEmail = user => {
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

module.exports = async (_, response) => {
  const { user, options } = response.locals
  const isPlainText = options.format !== 'html'

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
        src: getGravatarUrl(gravatarEmail)
      }
    })
  }

  const year = options.pinnedYear
    ? options.pinnedYear
    : removeFalsy([options.startYear, options.endYear]).join('-')
  const license = (options.license || user.license || 'MIT').toUpperCase()
  const format = options.format || user.format || 'html'

  try {
    const content = await renderFile(path.join(__dirname, '..', 'licenses', `${license}.ejs`), {
      info: `${year} ${name}`,
      theme: user.theme || 'default',
      gravatar
    })

    if (format === 'txt') {
      const plain = content.match(/<article>(.*)<\/article>/ms)[1]

      response
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .send(htmlUnescape(stripHtml(plain)).trim())
      return
    }

    if (format === 'html') {
      response.send(content)
      return
    }
    response.json({ ...user, ...options })
  } catch (error) {
    response.status(500).send(error)
  }
}
