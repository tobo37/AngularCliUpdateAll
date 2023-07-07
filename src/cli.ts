#!/usr/bin/env node

import { updateAll } from "./update-packages"
import { bold, green, underline } from "kleur"

const [,, ...args] = process.argv

export function handleArgs(args: string[]) {
    if(args.length > 0) {
      console.log("Invalid arguments - we don't take any arguments (yet)")
      return false;
    }
    return true;
  }

export function init(args: string[]){
    handleArgs(args)
    updateAll().then(() => console.log(green().underline().bold("update complete"))).catch((error) => console.error(error))
}

init(args)


