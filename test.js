#!/bin/env node

var fs = require('fs');
var users = fs.readdirSync('users');
users.forEach(function (user) {
  try {
    var content = fs.readFileSync('users/' + user).toString();
    JSON.parse(content);
  } catch (e) {
    console.error('Invalid JSON in file: ' + user);
    process.exit(1);
  }
});
