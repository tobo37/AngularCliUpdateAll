
import { Output, OutputCustom } from "./console-output";
import { TextEn } from "./model/text-en";
import { updateAll } from "./update-packages";
import { addOrUpdateConfigToPackageJson, loadConfig, loadPackageJson } from "./utility";

export function handleArgs(args: string[]) {
    if(args.length > 0) {
      let continueFlag = false;
      args.forEach((arg) => {
        switch(arg) {
          case "-h":
          case "--help":
            Output.simple(TextEn.CLI_HELP);
            break
          case "--add-config": {
            addConfig();
            continueFlag = true;
            break
          }            
          default:
            Output.simple(TextEn.CLI_INVALID_ARGS)
        }})
      return continueFlag;
    }
    return true;
  }

export function init(args: string[]){
    if(handleArgs(args)){
      updateAll().then(() => Output.greenBoldUnderline(TextEn.CLI_COMPLETE)).catch((error) => Output.error(error))
    }
}

function addConfig(){
  const packageJson = loadPackageJson()
  const config = loadConfig(packageJson)
  OutputCustom.addConfig(config)
  addOrUpdateConfigToPackageJson(packageJson, config)
}


