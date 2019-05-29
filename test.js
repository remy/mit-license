#!/bin/env node

const fs = require('fs')
const users = fs.readdirSync('users')
users.forEach(function(user) {
    try {
        const content = fs.readFileSync('users/' + user).toString()
        JSON.parse(content)
    } catch (e) {
        console.error('Invalid JSON in file: ' + user)
        process.exit(1)
    }
})
