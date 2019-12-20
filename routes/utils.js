const _ = require('lodash');

const tags = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
};
const untags = _.invert(tags);

module.exports = {
  escapeTags: str => (str || '').replace(/[<>&]/g, m => tags[m]),
  unescapeTags: str =>
    (str || '').replace(/(&lt;|&gt;|&amp;)/g, m => untags[m]),
  stripTags: str => (str || '').replace(/<(?:.|\n)*?>/gm, ''),
  validDomainId: str => /^[\w-_]+$/.test(str),
};
