const md5 = require('md5')
const path = require('path')
const { htmlEscape, htmlUnescape } = require('escape-goat')
const stripHtml = require('html-text')
const is = require('@sindresorhus/is')

function getCopyrightHTML (user, plain) {
  let html = ''

  const name = is.string(user)
    ? user
    : plain
      ? user.name || user.copyright
      : htmlEscape(user.name || user.copyright)

  if (user.url) {
    html = `<a href="${stripHtml(user.url)}">${name}</a>`
  } else {
    html = name
  }

  if (user.email) {
    html += ` &lt;<a href="mailto:${stripHtml(user.email)}">${
      plain ? user.email : htmlEscape(user.email)
      }</a>&gt;`
  }

  return html
}

module.exports = (req, res) => {
  const { user, options } = res.locals
  let name
  let gravatar

  // No error and valid
  if (user.copyright) {
    if (is.string(user.copyright)) {
      name = getCopyrightHTML(user, options.format !== 'html')
    } else if (is.array(user.copyright) && user.copyright.every(val => is.string(val))) {
      // Supports: ['Remy Sharp', 'Richie Bendall']
      name = user.copyright
        .map(v => (options.format !== 'html' ? v : htmlEscape(v)))
        .join(', ')
    } else {
      name = user.copyright.map(getCopyrightHTML).join(', ')
    }
  }

  if (user.gravatar && user.email) {
    // Supports regular format
    gravatar = `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(
      user.email.trim().toLowerCase()
    )}" />`
  } else if (is.object(user.copyright[0]) && user.gravatar) {
    // Supports multi-user format
    gravatar = `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(
      user.copyright[0].email.trim().toLowerCase()
    )}" />`
  }

  const year = options.pinnedYear
    ? options.pinnedYear
    : [options.startYear, options.endYear].filter(Boolean).join('-')
  const license = (options.license || user.license || 'MIT').toUpperCase()
  const format = options.format || user.format || 'html'

  const args = {
    info: `${year} ${name}`,
    theme: user.theme || 'default',
    gravatar
  }

  const filename = path.join(__dirname, '..', 'licenses', license)
  req.app.render(filename, args, (error, content) => {
    if (error) {
      res.status(500).send(error)
      return
    }

    if (format === 'txt') {
      const plain = content.match(/<article>(.*)<\/article>/ms)[1]

      res
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .send(htmlUnescape(stripHtml(plain)).trim())
      return
    }

    if (format === 'html') {
      res.send(content)
      return
    }

    res.json({ ...user, ...options })
  })
}
