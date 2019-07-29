const path = require('path');
const fs = require('fs');
const CSS = require('css');
const {
  validDomainId
} = require('./routes/utils');
const {
  promisify
} = require('util');
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const hasFlag = require('has-flag')

let errored = false;

function report(content, fix) {
  errored = true;
  console.error(content);
  if (fix && hasFlag("--fix")) fix()
}

(async () => {
  const users = await readdir('users');
  await users.forEach(async user => {
    if (!user.endsWith('json')) report(`${user} is not a json file`, () => fs.unlink(path.join('users', user), () => {}))
    if (!validDomainId(user.replace(".json", ""))) report(`${user} is not a valid domain id.`)
    try {
      const data = await readFile(path.join('users', user), "utf8")
      try {
        let u = JSON.parse(data);
        if (!u.locked && !u.copyright) report(`Copyright not specified in ${user}`)
        if (u.version) report(`Version tag found in ${user}`, () => {
          delete u.version
          const stringified = `${JSON.stringify(u, 0, 2)}\n`
          fs.writeFile(path.join('users', user), stringified, () => { })
        })
        const stringified = `${JSON.stringify(u, 0, 2)}\n`
        if (data !== stringified) report(`Non-regular formatting in ${user}`, () => fs.writeFile(path.join('users', user), stringified, () => {}))
      } catch ({
        message
      }) {
        report(`Invalid JSON in ${user} (${message})`)
      }
    } catch ({
      message
    }) {
      report(`Unable to read ${user} (${message})`)
    }
  });

  const themes = await readdir('themes');
  await themes.forEach(async theme => {
    if (theme.endsWith('css')) {
      try {
        const data = await readFile(path.join('themes', theme), "utf8")
        try {
          CSS.parse(data);
        } catch ({
          message
        }) {
          report(`Invalid CSS in ${theme} (${message})`)
        }
      } catch ({
        message
      }) {
        report(`Unable to read ${theme} (${message})`)
      }
    }
  });
  if (errored) process.exit(1);
})()
