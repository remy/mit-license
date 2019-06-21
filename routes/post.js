const fs = require('fs');
const path = require('path');
const {
  promisify
} = require('util');
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const btoa = require('btoa');
var github = require('@octokit/rest')({
  // GitHub personal access token
  auth: process.env.github_token,
  // User agent with version from package.json
  userAgent: 'mit-license v' + require(path.join(__dirname, "..", "package.json")).version,
});
const { validDomainId } = require('./utils');

function getUserData({
  query,
  body
}) {
  // If query parameters provided
  if (Object.keys(query).length > 0) return query;
  // If the data parsed as {'{data: "value"}': ''}
  const keys = Object.keys(body);
  if (keys.length === 1 && !Object.values(body)[0]) return JSON.parse(keys[0]);
  // Fallback
  return body;
}

// HTTP POST API
module.exports = async (req, res) => {
  const {
    hostname
  } = req;
  // Get different parts of hostname (example: remy.mit-license.org -> ['remy', 'mit-license', 'org'])
  const params = hostname.split('.');

  // This includes the copyright, year, etc.
  const userData = getUserData(req);

  // If there isn't enough part of the hostname
  if (params.length < 2) {
    res.status(400).send('Please specify a subdomain in the URL.');
    return;
  }

  // Extract the name from the URL
  const id = params[0];

  if (!validDomainId(id)) {
    // Return a vague error intentionally
    res
      .status(400)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      );

    return;
  }

  try {
    // Check if the user file exists in the users directory
    await access(path.join(__dirname, '..', 'users', `${id}.json`));
    res
        .status(409)
        .send(
          'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
        )
    return;
  } catch ({code, message}) {
    if (code !== "ENOENT") {
      res.code(500).send(`An internal error occurred - open an issue on https://github.com/remy/mit-license with the following information: ${message}`)
      return;
    }
  }

  // File doesn't exist
  // If copyright property and key doesn't exist
  if (!userData.copyright) {
    res.status(400).send('JSON requires "copyright" property and value');
    return;
  }

  try {
    const fileContent = JSON.stringify(userData, 0, 2)

    await github.repos.createFile({
      owner: 'remy',
      repo: 'mit-license',
      path: `users/${id}.json`,
      message: `Automated creation of user ${id}.`,
      content: btoa(fileContent),
      committer: {
        name: 'MIT License Bot',
        email: 'remy@leftlogic.com',
      },
    })

    writeFile(
      path.join(__dirname, "..", "users", `${id}.json`),
      fileContent
    );

    res.status(201).send(`MIT license page created: https://${hostname}`);
  } catch(err) {
    res.status(500).send(`Unable to create new user - please send a pull request on https://github.com/remy/mit-license`)
  }
};
