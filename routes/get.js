const md5 = require('md5');
const path = require('path');
const { stripTags, escapeTags } = require('./utils');

function getCopyrightHTML(user, plain) {
  let html = '';

  const name = typeof user === "string" ? user
    : plain ? user.name || user.copyright
    : escapeTags(user.name || user.copyright);

  if (user.url) {
    html = `<a href="${stripTags(user.url)}">${name}</a>`;
  } else {
    html = name;
  }

  if (user.email) {
    html += ` &lt;<a href="mailto:${stripTags(user.email)}">${
      plain ? user.email : escapeTags(user.email)
      }</a>&gt;`;
  }

  return html;
}

module.exports = (req, res) => {
  const { user, options } = res.locals;
  let name;
  let gravatar;

  // No error and valid
  if (user.copyright) {
    if (typeof user.copyright === 'string') {
      name = getCopyrightHTML(user, options.format !== 'html');
    } else if (user.copyright.every(val => typeof val === 'string')) {
      // Supports: ['Remy Sharp', 'Richie Bendall']
      name = user
        .map(_ => (options.format !== 'html' ? _ : escapeTags(_)))
        .join(', ');
    } else {
      name = user.copyright
        .map(getCopyrightHTML)
        .join(', ');
    }
  }

  if (user.gravatar && user.email) {
    // Supports regular format
    gravatar = `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(
      user.email.trim().toLowerCase()
    )}" />`;
  } else if (typeof user.copyright[0] === 'object' && user.gravatar) {
    // Supports multi-user format
    gravatar = `<img id="gravatar" alt="Profile image" src="https://www.gravatar.com/avatar/${md5(
      user.copyright[0].email.trim().toLowerCase()
    )}" />`;
  }

  const year = options.pinnedYear
    ? options.pinnedYear
    : [options.startYear, options.endYear].filter(Boolean).join('-');
  const license = (options.license || user.license || 'MIT').toUpperCase();
  const format = options.format || user.format || 'html';

  const args = {
    info: `${year} ${name}`,
    theme: user.theme || 'default',
    gravatar,
  };

  const filename = path.join(__dirname, '..', 'licenses', license);
  req.app.render(filename, args, (error, content) => {
    if (error) {
      res.status(500).send(error);
      return;
    }

    if (format === 'txt') {
      const plain = content.match(/<article>(.*)<\/article>/ms)[1];

      res
        .set('Content-Type', 'text/plain; charset=UTF-8')
        .send(stripTags(plain).trim());
      return;
    }

    if (format === 'html') {
      res.send(content);
      return;
    }

    res.json({ ...user, ...options });
  });
};
