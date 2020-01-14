const fs = require('fs-extra')
const path = require('path')
const btoa = require('btoa')
const { version } = require(path.join(__dirname, '..', 'package.json'))
const _ = require('lodash')
const github = require('@octokit/rest')({
  // GitHub personal access token
  auth: process.env.github_token,
  // User agent with version from package.json
  userAgent: `mit-license v${version}`
})
const yn = require('yn')

const { validDomainId } = require('./utils')

function getUserData ({ query, body }) {
  // If query parameters provided
  if (_.size(query) > 0) return query
  // If the data parsed as {'{data: "value"}': ''}
  if (_.size(body) === 1 && !_.first(_.values(body))) return JSON.parse(_.first(_.keys(body)))
  // Fallback
  return body
}

// HTTP POST API
module.exports = async (req, res) => {
  const { hostname } = req
  // Get different parts of hostname (example: remy.mit-license.org -> ['remy', 'mit-license', 'org'])
  const params = hostname.split('.')

  // This includes the copyright, year, etc.
  const userData = getUserData(req)

  // If there isn't enough part of the hostname
  if (params.length < 2) {
    res.status(400).send('Please specify a subdomain in the URL.')
    return
  }

  // Extract the name from the URL
  const id = _.first(params)

  if (!validDomainId(id)) {
    // Return a vague error intentionally
    res
      .status(400)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      )

    return
  }

  // Check if the user file exists in the users directory
  const exists = await fs.pathExists(path.join(__dirname, '..', 'users', `${id}.json`))
  if (exists) {
    res
      .status(409)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      )
    return
  }

  if (userData.gravatar) {
    // Parse the string version of a boolean or similar
    userData.gravatar = yn(userData.gravatar, { lenient: true })
    if (_.isUndefined(userData.gravatar)) {
      res
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
    res.status(400).send('JSON requires "copyright" property and value')
    return
  }

  try {
    const fileContent = JSON.stringify(userData, 0, 2)

    await github.repos.createOrUpdateFile({
      owner: 'remy',
      repo: 'mit-license',
      path: `users/${id}.json`,
      message: `chore: Automated creation of user ${id}.`,
      content: btoa(fileContent),
      committer: {
        name: 'MIT License Bot',
        email: 'remy@leftlogic.com'
      }
    })

    await fs.writeFile(path.join(__dirname, '..', 'users', `${id}.json`), fileContent)

    res.status(201).send(`MIT license page created: https://${hostname}`)
  } catch (err) {
    res
      .status(500)
      .send(
        'Unable to create new user - please send a pull request on https://github.com/remy/mit-license'
      )
  }
}
