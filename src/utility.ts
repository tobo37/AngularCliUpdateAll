import * as cp from "child_process";
import * as fs from 'fs';
import simpleGit from "simple-git";
import { AngularUpdateConfig } from "./config/update-config";
import AngularUpdateDefaultConfig from "./config/update-config.json";
import { Output, OutputCustom } from "./console-output";
import { PackageJson } from "./model/packagejson.model";


export function npmSync(args: string[]) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return cp.spawnSync(npmCommand, args, { stdio: "inherit", shell: false });
}

export function npxSync(args: string[]) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  return cp.spawnSync(npxCommand, args, { stdio: "inherit", shell: false });
}

export async function gitSync(packageName: string) {
  const git = simpleGit();
  OutputCustom.gitAdd(packageName);
  try {
    await git.add(".").commit(packageName);
  } catch (error) {
    if (error instanceof Error) {
      Output.error(error.message);
    }
  }
}

export function loadPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

export function savePackageJson(packageJson: PackageJson) {
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2), 'utf8');
}

export function addOrUpdateConfigToPackageJson(packageJson: PackageJson, config: AngularUpdateConfig) {
  packageJson.updateThemAll = config;
  savePackageJson(packageJson);
}

export function loadConfig(packageJson: PackageJson): AngularUpdateConfig {
  const config = loadConfigFile(packageJson);
  console.log("config-loaded: ", config)
  if (config.keepAngularMajorVersion) {
    config.ignoreDependencies = filterAngular(Object.keys(packageJson.dependencies), config.ignoreDependencies);
    config.ignoreDevDependencies = filterAngular(Object.keys(packageJson.devDependencies), config.ignoreDevDependencies);
  }
  return config;
}

export function loadConfigFile(packageJson: PackageJson): AngularUpdateConfig {
  if(packageJson.updateThemAll){
    return packageJson.updateThemAll;
  }
  else{
    return AngularUpdateDefaultConfig  }
}

function filterAngular(depList: string[], ignoreList: string[]) {
  depList.forEach((dep) => {
    if (dep.includes("@angular")) {
      ignoreList.push(dep);
    }
  });
  return ignoreList;
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