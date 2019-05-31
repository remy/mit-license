#!/bin/env node

const path = require('path')
const fs = require('fs')
const users = fs.readdirSync('users')
users.forEach(async user => {
    try {
        const content = fs.readFileSync(path.join('users', user), "utf8")
        JSON.parse(content)
    } catch (e) {
        console.error(`Invalid JSON in file: ${user} (${e})`)
        process.exit(1)
    }
})
console.log("All JSON valid!")
