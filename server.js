"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var fs = require("fs");
var PORT = process.env.PORT || 80;
var compression = require("compression");
var md5 = require("md5");
var humanize_list_1 = require("humanize-list");
var minify = require("express-minify");
var ejs = require('ejs');
var util_1 = require("./util");
var HTML = require('node-html-parser');
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
// Allow CORS
app.use(function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// HTTP POST API
app.post('/', function (_req, res) {
    res.end();
});
// Any other HTTP GET request
app.get('*', function (req, res) {
    // Get user id (example: 'rem.mit-license.org/@2019' -> 'rem')
    var id = req.hostname.split('.')[0];
    // Get params (example: 'rem.mit-license.org/@2019' -> ['@2019'])
    var params = req.path.split('/');
    params.shift();
    // Load the user data (example: from 'rem.mit-license.org/@2019' -> 'users/rem.json')
    fs.readFile(path.join('users', id + ".json"), 'utf8', function (err, data) {
        var name;
        var theme;
        var gravatar;
        var user = JSON.parse(data || '{}');
        // If error opening
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                name = '<copyright holders>';
                theme = 'default';
                gravatar = '';
            }
            else {
                // Other error
                res.status(500).end();
                return;
            }
        }
        else {
            // No error
            name = typeof user.copyright === 'string' ? user.copyright : humanize_list_1["default"](user.copyright);
            theme = user.theme || 'default';
            gravatar = user.gravatar ? "<img id=\"gravatar\" alt=\"Profile image\" src=\"https://www.gravatar.com/avatar/" + md5(user.email.trim().toLowerCase()) + "\" />" : '';
        }
        var year = (function () {
            // rem.mit-license.org/@2019
            var customYear = params.find(function (val) { return val.startsWith('@'); });
            // rem.mit-license.org/2019
            var fromYear = params.find(function (val) { return !isNaN(parseInt(val.replace('-', ''))); });
            // If current year
            if (customYear)
                return customYear.replace(/[@-]/g, '');
            // If from year
            if (fromYear) {
                // If from year is same as current
                if (parseInt(fromYear) === util_1.yearNow)
                    return util_1.yearNow;
                return fromYear.replace('-', '') + "-" + util_1.yearNow.toString().replace('-', '');
            }
            return util_1.yearNow;
        })();
        var customLicense = params.find(function (val) { return val.startsWith('+'); });
        var license = customLicense ? customLicense.replace('+', '') : user.license || 'MIT';
        var format = params.find(function (val) { return val === 'license.html'; }) ? 'html' : params.find(function (val) { return val === 'license.txt'; }) ? 'txt' : user.format || 'html';
        var args = {
            info: year + " " + name,
            theme: theme,
            gravatar: gravatar
        };
        if (format === 'html')
            res.render(path.join(__dirname, 'licenses', license), args);
        else {
            ejs.renderFile(path.join(__dirname, 'licenses', license + ".ejs"), args, function (_err, str) {
                return res
                    .set('Content-Type', 'text/plain; charset=UTF-8')
                    .send(util_1.trimArray(util_1.stripTags(HTML.parse(str).childNodes[0].childNodes[3].childNodes[1].toString())
                    .split('\n')
                    .map(function (val) { return val.trim(); }))
                    .join('\n'));
            });
        }
    });
});
// Start listening for HTTP requests
app.listen(PORT);
