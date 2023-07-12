import * as cp from "child_process";
import * as fs from 'fs';
import { yellow } from "kleur";
import { PackageJson } from "./model/packagejson.model";


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

export function loadConfig(packageJson: PackageJson) {
  const config = loadConfigFile();
  if(config.keepAngularMayorVersion){
    Object.keys(packageJson.dependencies).forEach((dep) => {
      if(dep.includes("@angular")){
        config.ignoreDependencies.push(dep);
      }
    });
    Object.keys(packageJson.devDependencies).forEach((dep) => {
      if(dep.includes("@angular")){
        config.ignoreDevDependencies.push(dep);
      }
    });
  }
  return config;
}

export function loadConfigFile(){
  try {
    return JSON.parse(fs.readFileSync('update-config.json', "utf-8"));
  } catch {
    console.log(yellow(`Configuration not found. We're using a default configuration instead. 
    If you want to create a configuration, create a file named "update-config.json" in the root directory of your project with the following content:
    
    {
      "keepAngularMayorVersion": true,
      "removeVersioningSymbols": false,
      "ignoreDependencies": [],
      "ignoreDevDependencies": []
    }
    `))
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