#!/usr/bin/env node

const { updateAll } = require("./update-packages")
const [,, ...args] = process.argv

updateAll()