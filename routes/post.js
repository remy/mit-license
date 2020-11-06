const path = require('path')
const btoa = require('btoa')
const { version } = require(path.join(__dirname, '..', 'package.json'))
const size = require('any-size')
const { Octokit } = require('@octokit/rest')
const pathExists = require('path-exists')
const writeJsonFile = require('write-json-file')
const github = new Octokit({
  // GitHub personal access token
  auth: process.env.github_token,
  // User agent with version from package.json
  userAgent: `mit-license v${version}`
})
const yn = require('yn')
const is = require('@sindresorhus/is')

const { isDomainId } = require('./utils')

function getUserData ({ query, body }) {
  // If query parameters provided
  if (size(query) > 0) {
    return query
  }

  // If the data parsed as {'{data: "value"}': ''}
  if (size(body) === 1 && !Object.values(body)[0]) {
    return JSON.parse(Object.keys(body)[0])
  }

  // Fallback
  return body
}

// HTTP POST API
module.exports = async (request, response) => {
  const { hostname } = request

  // Get different parts of hostname (example: remy.mit-license.org -> ['remy', 'mit-license', 'org'])
  const params = hostname.split('.')

  // This includes the copyright, year, etc.
  const userData = getUserData(request)

  // If there isn't enough part of the hostname
  if (params.length < 2) {
    response.status(400).send('Please specify a subdomain in the URL.')
    return
  }

  // Extract the name from the URL
  const [id] = params

  if (!isDomainId(id)) {
    // Return a vague error intentionally
    response
      .status(400)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      )

    return
  }

  // Check if the user file exists in the users directory
  if (await pathExists(path.join(__dirname, '..', 'users', `${id}.json`))) {
    response
      .status(409)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      )
    return
  }

  if (userData.gravatar) {
    // Parse the string version of a boolean or similar
    userData.gravatar = yn(userData.gravatar, { lenient: true })
    if (is.undefined(userData.gravatar)) {
      response
        .status(400)
        .send(
          'The "gravatar" JSON property must be a boolean.'
        )
      return
    }
  }

  // File doesn't exist
  // If copyright property and key doesn't exist
  if (!userData.copyright) {
    response.status(400).send('JSON requires "copyright" property and value')
    return
  }

  try {
    await Promise.all([
      github.repos.createOrUpdateFileContents({
        owner: 'remy',
        repo: 'mit-license',
        path: `users/${id}.json`,
        message: `Automated creation of user ${id}.`,
        content: btoa(JSON.stringify(userData, 0, 2)),
        committer: {
          name: 'MIT License Bot',
          email: 'remy@leftlogic.com'
        }
      }),
      writeJsonFile(path.join(__dirname, '..', 'users', `${id}.json`), userData, { indent: undefined })
    ])

    response.status(201).send(`MIT license page created: https://${hostname}`)
  } catch {
    response
      .status(500)
      .send(
        'Unable to create new user - please send a pull request on https://github.com/remy/mit-license'
      )
  }
}
