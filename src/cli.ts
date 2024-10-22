

import { readFileSync } from "node:fs";
import { askForConfig } from "./config-questions";
import { Output } from "./console-output";
import { TextEn } from "./model/text-en";
import { updateAll } from "./update-packages";


export function init(args: string[]) {
  welcomeMessage()
  const config = askForConfig()
  updateAll(config).then(() => Output.greenBoldUnderline(TextEn.CLI_COMPLETE)).catch((error) => Output.error(error))
}

function welcomeMessage() {
  try {
    const packageJson = JSON.parse(readFileSync(`${__dirname}/../package.json`, 'utf8'));
    const version = packageJson.version;

    // Display the welcome message with the version number
    Output.bold(`Welcome to update-them-all! You are using version ${version}.`);
    Output.simple("Let's start updating your Angular project!");
  } catch (error: any) {
    Output.error("Error reading package version. Make sure the package.json file is present and correctly formatted.");
  }

}






