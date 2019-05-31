#!/bin/env node

const path = require('path')
const fs = require('fs')
const CSS = require('css')
let errored = false

const users = fs.readdirSync('users')
users.forEach(async user => {
    if (user.endsWith("json")) {
        fs.readFile(path.join('users', user), "utf8", async (err, content) => {
            if (err) {
                errored = true
                console.error(`Unable to read ${user}`)
            } else {
                try {
                    JSON.parse(content)
                } catch (e) {
                    errored = true
                    console.error(`Invalid JSON in file: ${user} (${e})`)
                }
            }
        })
    } else {
        errored = true
        console.error(`${user} is not a json file`)
    }
})

const themes = fs.readdirSync('themes')
themes.forEach(async theme => {
    if (theme.endsWith("css")) {
        fs.readFile(path.join('themes', theme), "utf8", async (err, content) => {
            if (err) {
                errored = true
                console.error(`Unable to read ${theme}`)
            } else {
                try {
                    CSS.parse(content)
                } catch (e) {
                    errored = true
                    console.error(`Invalid CSS in file: ${theme} (${e})`)
                }
            }
        })
    }
})

if (errored) process.exit(1)
