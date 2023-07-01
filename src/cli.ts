#!/usr/bin/env node

import { updateAll } from "./update-packages"

const [,, ...args] = process.argv

updateAll().then(() => console.log("update complete")).catch((error) => console.error(error))
