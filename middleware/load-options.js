const currentYear = new Date().getFullYear()

module.exports = (req, res, next) => {
  const parts = req.url.split('/')

  res.locals.options = parts.reduce(
    (acc, curr) => {
      if (!curr) return acc

      let match = curr.match(/^@?(\d{4})$/) || []

      if (match.length) {
        // Pinned year
        if (curr.startsWith('@')) {
          acc.pinnedYear = parseInt(curr.substr(1), 10)
        } else {
          acc.startYear = parseInt(curr, 10)
        }
        return acc
      }

      match = curr.match(/^(\d{4})-(\d{4})$/) || []

      if (match.length) {
        acc.startYear = parseInt(match[1], 10)
        acc.endYear = parseInt(match[2], 10)

        return acc
      }

      if (curr.startsWith('license')) {
        acc.format = curr
          .split('.')
          .pop()
          .trim()
        return acc
      }

      if (curr.startsWith('+')) {
        acc.license = curr.substr(1).toUpperCase()
        return acc
      }

      acc.sha = curr // not actually supported now - 2019-06-19
      return acc
    },
    {
      format: 'html',
      startYear: null,
      endYear: currentYear,
      sha: null
    }
  )

  if (res.locals.options.sha) {
    res.setHeader(
      'X-note',
      'SHA and commit pinning is no longer supported, showing you latest release'
    )
  }

  next()
}
