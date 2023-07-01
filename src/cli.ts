#!/usr/bin/env node

import { updateAll } from "./update-packages"

const [,, ...args] = process.argv

if(args.length > 0) {
    console.log("Invalid arguments - we don't take any arguments (yet)")
}

updateAll().then(() => console.log("update complete")).catch((error) => console.error(error))
