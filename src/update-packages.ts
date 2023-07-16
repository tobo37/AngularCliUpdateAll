#!/usr/bin/env node

import * as fs from 'fs';
import { PackageJson } from './model/packagejson.model';
import { filterDependancies, getAngularMayorVersion, gitSync, loadConfig, loadPackages, npmSync, npxSync } from "./utility";
import { Output, OutputCustom } from './console-output';
import { TextEn } from './model/text-en';


export async function stageAndCommitChanges(packageName: string) {
  OutputCustom.gitAdd(packageName);
  try {
    gitSync(["add", "."]);
    gitSync(["diff", "--cached", "--quiet"]);
  } catch (error) {
    gitSync(["commit", "-m", packageName]);
  }
}

export async function updateAngular(keepAngularMayorVersion: boolean, packageJson: PackageJson) {
  if(keepAngularMayorVersion) {
    const angularVersion = getAngularMayorVersion(packageJson);
    npxSync(["ng", "update", `@angular/cli@${angularVersion}`, `@angular/core@${angularVersion}`]);
  } else {
    npxSync(["ng", "update", "@angular/cli", "@angular/core"]);
  }
  await stageAndCommitChanges("@angular/cli @angular/core");
}

export async function updatePackages(packages: string[], type: string) {
  OutputCustom.updatingNext(type);

  for (const packageName of packages) {
    try {
      npxSync(["ng", "update", packageName, "--allow-dirty"]);
    } catch (error) {
      if (error instanceof Error) {
        OutputCustom.updatePackageError(packageName, error);        
      }
    }
  }

  const packageNames = packages.join(" ");

  await stageAndCommitChanges(packageNames);
}

export async function updatePackagesFast(packages: string[]) {
  Output.boldItalic(TextEn.UP_STARTING_UPDATING_FAST)

  npxSync(["ng", "update", ...packages]);

  const packageNames = packages.join(" ");
  await stageAndCommitChanges(packageNames);
}

async function npmAuditFix() {
  Output.boldItalic(TextEn.UP_STARTING_NPM_AUDIT);

  try {
    npmSync(["audit", "fix"])
    await stageAndCommitChanges("npm audit fix");
  } catch (error) {
    if (error instanceof Error) {
      OutputCustom.npmAuditError(error);
    }
    
  }
}

// This function is used to remove the versioning symbols (~ and ^) from the dependencies and devDependencies in a package.json file.

export function removeVersioningSymbols(filepath: string) {
  // Read the package.json file and parse it into a JavaScript object.
  const  packageObj = JSON.parse(fs.readFileSync(filepath, "utf-8"));

  // Extract the dependencies and devDependencies objects from the package.json object.
  const dependencies = packageObj.dependencies;
  const devDependencies = packageObj.devDependencies;

  // Iterate over each dependency in the dependencies object.
  for (const dep in dependencies) {
    // Replace any instance of ~ or ^ in the version string with an empty string, effectively removing them.
    dependencies[dep] = dependencies[dep].replace(/[~^]/g, '');
  }

  // Iterate over each dependency in the devDependencies object.
  for (const dep in devDependencies) {
    // Replace any instance of ~ or ^ in the version string with an empty string, effectively removing them.
    devDependencies[dep] = devDependencies[dep].replace(/[~^]/g, '');
  }

  // Write the modified package.json object back to the file.
  fs.writeFileSync(filepath, JSON.stringify(packageObj, null, 2));
}


/**

 * Main function to update all packages.

 */

export async function updateAll() {
  
  const packageJson = loadPackages();
  const config = loadConfig(packageJson);

  const dependencies = filterDependancies(Object.keys(packageJson.dependencies), config.ignoreDependencies);
  const devDependencies = filterDependancies(Object.keys(packageJson.devDependencies), config.ignoreDevDependencies);

  await updateAngular(config.keepAngularMayorVersion, packageJson);
  try {
    await updatePackagesFast(dependencies);
  } catch {
    Output.yellow(TextEn.UP_ERROR_UPDATE_FAST);

    await updatePackages(dependencies, "dependencies");
  }

  try {
    await updatePackagesFast(devDependencies);
  } catch {
    Output.yellow(TextEn.UP_ERROR_UPDATE_FAST);
    await updatePackages(devDependencies, "devDependencies");
  }

  if(config.removeVersioningSymbols) {
    removeVersioningSymbols("package.json");
  }

  await npmAuditFix();
}


exports.updateAll = updateAll;
exports.updatePackagesFast = updatePackagesFast;
exports.updatePackages = updatePackages;