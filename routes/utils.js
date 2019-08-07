const tags = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
};
exports.escapeTags = str => (str || '').replace(/[<>&]/g, m => tags[m]);
exports.stripTags = str => (str || '').replace(/<(?:.|\n)*?>/gm, '');
exports.validDomainId = str => /^[\w-_]+$/.test(str);
