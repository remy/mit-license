const currentYear = new Date().getFullYear()

const yearRegex = /^@?(\d{4})$/
const yearRangeRegex = /^(\d{4})-(\d{4})$/

const getUrlParts = url => {
  if (url === '/') {
    return []
  }

  return url.slice(1).split('/')
}

module.exports = (request, response, next) => {
  const urlParts = getUrlParts(request.url)

  response.locals.options = {
    format: 'html',
    startYear: null,
    endYear: currentYear
  }

  for (const urlPart of urlParts) {
    if (yearRegex.test(urlPart)) {
      if (urlPart.startsWith('@')) {
        response.locals.options.pinnedYear = Number.parseInt(urlPart.slice(1))
      } else {
        response.locals.options.startYear = Number.parseInt(urlPart)
      }
    } else if (yearRangeRegex.test(urlPart)) {
      const [startYear, endYear] = urlPart.match(yearRangeRegex).slice(1)

      response.locals.options.startYear = Number.parseInt(startYear)
      response.locals.options.endYear = Number.parseInt(endYear)
    } else if (urlPart.startsWith('license')) {
      response.locals.options.format = urlPart.split('.')[1].trim()
    } else if (urlPart.startsWith('+')) {
      response.locals.options.license = urlPart.slice(1).toUpperCase()
    }
  }

  next()
}
