const currentYear = new Date().getFullYear()

const yearRegex = /^@?(\d{4})$/
const yearRangeRegex = /^(\d{4})-(\d{4})$/

const getUrlParts = url => {
  if (url === '/') {
    return []
  }

  return url.slice(1).split('/')
}

const loadOptions = url => {
  const urlParts = getUrlParts(url)

  const options = {
    format: 'html',
    startYear: null,
    endYear: currentYear,
  }

  for (const urlPart of urlParts) {
    if (yearRegex.test(urlPart)) {
      if (urlPart.startsWith('@')) {
        options.pinnedYear = Number.parseInt(urlPart.slice(1), 10)
      } else {
        options.startYear = Number.parseInt(urlPart, 10)
      }
    } else if (yearRangeRegex.test(urlPart)) {
      const [startYear, endYear] = urlPart.match(yearRangeRegex).slice(1)

      options.startYear = Number.parseInt(startYear, 10)
      options.endYear = Number.parseInt(endYear, 10)
    } else if (urlPart.startsWith('license')) {
      options.format = urlPart.split('.')[1].trim()
    } else if (urlPart.startsWith('+')) {
      options.license = urlPart.slice(1).toUpperCase()
    }
  }

  return options
}

export default loadOptions
