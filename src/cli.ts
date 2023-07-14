#!/usr/bin/env node
import { updateAll } from "./update-packages";
import { Output } from "./console-output";
import { TextEn } from "./model/text-en";

const [,, ...args] = process.argv

export function handleArgs(args: string[]) {
    if(args.length > 0) {
      Output.simple(TextEn.CLI_INVALID_ARGS)
      return false;
    }
    return true;
  }

export function init(args: string[]){
    handleArgs(args)
    updateAll().then(() => Output.greenBoldUnderline(TextEn.CLI_COMPLETE)).catch((error) => Output.error(error))
}

init(args)


