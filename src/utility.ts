import * as cp from "child_process";
import * as fs from 'fs';
import { PackageJson } from "./model/packagejson.model";
import { Output, OutputCustom } from "./console-output";
import { TextEn } from "./model/text-en";
import simpleGit from "simple-git";


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
      OutputCustom.npmAuditError(error);
    }
  }
}

export function loadPackages(): PackageJson {
  return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

export function loadConfig(packageJson: PackageJson) {
  const config = loadConfigFile();
  if (config.keepAngularMayorVersion) {
    config.ignoreDependencies = filterAngular(Object.keys(packageJson.dependencies), config.ignoreDependencies);
    config.ignoreDevDependencies = filterAngular(Object.keys(packageJson.devDependencies), config.ignoreDevDependencies);
  }
  return config;
}

function filterAngular(depList: string[], ignoreList: string[]) {
  depList.forEach((dep) => {
    if (dep.includes("@angular")) {
      ignoreList.push(dep);
    }
  });
  return ignoreList;
}

export function loadConfigFile() {
  try {
    return JSON.parse(fs.readFileSync('update-config.json', "utf-8"));
  } catch {
    Output.yellow(TextEn.UTIITY_CONFIG_NOT_FUND);
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