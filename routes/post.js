const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const btoa = require('btoa');
var github = require('@octokit/rest')({
  // GitHub personal access token
  auth: process.env.github_token,
  // User agent with version from package.json
  userAgent: 'mit-license v' + require(__dirname + '/../package.json').version,
});

function getUserData({ query, body }) {
  // If query parameters provided
  if (Object.keys(query).length > 0) return query;
  // If the data parsed as {'{data: "value"}': ''}
  const keys = Object.keys(body);
  if (keys.length === 1 && !Object.values(body)[0]) return JSON.parse(keys[0]);
  // Fallback
  return body;
}

const validDomain = s => /^[\w-_]+$/.test(s);

// HTTP POST API
module.exports = async (req, res) => {
  const { hostname } = req;
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

  if (!validDomain(id)) {
    // return a vague error intentionally
    res
      .status(400)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      );

    return;
  }

  // Check if the user file exists in the users directory
  try {
    const res = await access(path.join(__dirname, '..', 'users', `${id}.json`)); // will throw if doesn't exist
    res
      .status(409)
      .send(
        'User already exists - to update values, please send a pull request on https://github.com/remy/mit-license'
      );

    return;
  } catch (e) {
    console.log(e);
    // FIXME only allow file doesn't exist to continue
  }

  // File doesn't exist
  // If copyright property and key doesn't exist
  if (!userData.copyright) {
    res.status(400).send('JSON requires "copyright" property and value');
    return;
  }

  try {
    const success = await github.repos.createFile({
      owner: 'remy',
      repo: 'mit-license',
      path: `users/${id}.json`,
      message: `Automated creation of user ${id}.`,
      content: btoa(JSON.stringify(userData, 0, 2)),
      committer: {
        name: 'MIT License Bot',
        email: 'remy@leftlogic.com',
      },
    });

    // TODO copy the user.json into the users/ directory, it'll work
    writeFile(
      `${__dirname}/../users/${id}.json`,
      JSON.stringify(userData, 0, 2)
    );

    console.log(success);
    res.status(201).send(`MIT license page created: https://${hostname}`);
  } catch (err) {
    console.log(err);
    res
      .status(502)
      .send(
        'Unable to create new user - please send a pull request on https://github.com/remy/mit-license'
      );
  }
};