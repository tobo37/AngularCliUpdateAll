#!/usr/bin/env node

const { updateAll } = require("./update-packages")
const [,, ...args] = process.argv

updateAll().then(() => console.log("update complete")).catch((error) => console.error(error))