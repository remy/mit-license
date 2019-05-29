var express = require('express');
var path = require('path');
var fs = require('fs');
var PORT = process.env.PORT || 80;
var compression = require('compression');
var dayjs = require('dayjs');
var md5 = require('md5');
var humanizeList = require('humanize-list');
var minify = require('express-minify');
// Prepare application
var app = express();
app.use(compression());
app.use(minify({
    cache: require('tmp').dirSync().name
}));
app.set('view engine', 'ejs');
// Setup static files
app.use('/themes', express.static('themes'));
app.use('/users', express.static('users'));
app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
// Setup useful variables
var yearNow = dayjs().year();
// HTTP POST API
app.post('/', function (req, res) {
    res.end();
});
// Any other HTTP GET request
app.get('*', function (req, res) {
    // Get user id (example: 'rem.mit-license.org/@2019' -> 'rem')
    var id = req.hostname.split('.')[0];
    // Get params (example: 'rem.mit-license.org/@2019' -> ['@2019'])
    var params = req.path.split('/');
    params.shift();
    //
    var year = yearNow;
    // Load the user data (example: from 'rem.mit-license.org/@2019' -> 'users/rem.json')
    fs.readFile(path.join('users', id + ".json"), 'utf8', function (err, data) {
        var info, theme, gravatar;
        // If error opening
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                info = year + " <copyright holders>";
                theme = 'default';
                gravatar = '';
            }
            else {
                // Other error
                res.status(500).end();
            }
        }
        else {
            // No error
            var user = JSON.parse(data);
            info = year + " " + (typeof user.copyright === 'string' ? user.copyright : humanizeList(user.copyright));
            theme = user.theme || 'default';
            gravatar = user.gravatar ? "<img id=\"gravatar\" alt=\"Profile image\" src=\"https://www.gravatar.com/avatar/" + md5(user.email.trim().toLowerCase()) + "\" />" : '';
        }
        // Parse the options specified in the URL
        res.render(path.join(__dirname, 'licenses', 'MIT.ejs'), {
            info: info,
            theme: theme,
            gravatar: gravatar
        });
    });
});
// Start listening for HTTP requests
app.listen(PORT);
