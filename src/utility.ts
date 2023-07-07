import * as cp from "child_process";
import * as fs from 'fs';
import { PackageJson } from "./model/packagejson.model";
import {yellow} from "kleur";


export function npmSync(args: string[]) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return cp.spawnSync(npmCommand, args, { stdio: "inherit", shell: false});
}

export function npxSync(args: string[]) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  return cp.spawnSync(npxCommand, args, { stdio: "inherit", shell: false});
}

export function gitSync(args: string[]) {
  const gitCommand = process.platform === "win32" ? "git.cmd" : "git";
  return cp.spawnSync(gitCommand, args, { stdio: "inherit", shell: false });
}

export function loadPackages(): PackageJson {
  return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

export function loadConfig() {
  const config = loadConfigFile();
  if(config.keepAngularMayorVersion){
    config.ignoreDependencies.push("@angular/cli");
    config.ignoreDependencies.push("@angular/core");
    config.ignoreDevDependencies.push("@angular/cli");
    config.ignoreDevDependencies.push("@angular/core");
  }
  return config;
}

export function loadConfigFile(){
  try {
    return JSON.parse(fs.readFileSync('update-config.json', "utf-8"));
  } catch {
    console.log(yellow("no config file found, using default config"))
    return {
      "keepAngularMayorVersion": true,
      "removeVersioningSymbols": false,
      "ignoreDependencies": [],
      "ignoreDevDependencies": []
    }
  }
}

export function filterDependancies(dependencies: string[], igonreDependencies: string[]) {
  return dependencies.filter((dep) => !igonreDependencies.includes(dep));
}

export function getAngularMayorVersion(packageJson: PackageJson) {
  const angularVersion = packageJson.dependencies['@angular/core'] || packageJson.devDependencies['@angular/core'];
  if (!angularVersion) {
    return null;
  }
  const angularVersionNumber = angularVersion.replace(/[^0-9.]/g, '');
  const angularMayorVersion = angularVersionNumber.split('.')[0];
  return angularMayorVersion;
}