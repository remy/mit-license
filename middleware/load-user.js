const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const path = require('path');

module.exports = async (req, res, next) => {
  const id = req.hostname.split('.')[0];
  res.locals.id = id;

  if (req.method.toUpperCase() !== 'GET') {
    return next();
  }

  // otherwise load up the user json file
  res.locals.user = {
    copyright: '<copyright holders>',
  };
  try {
    const file = await readFile(
      path.join(__dirname, '..', 'users', `${id}.json`),
      'utf8'
    );
    res.locals.user = JSON.parse(file);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      // Error is *not* "File not found"
      console.log(e);

      res.status(500).end();
      return;
    }
  }

  next();
};
