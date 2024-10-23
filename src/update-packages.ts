#!/usr/bin/env node

import * as fs from 'fs';
import { AngularUpdateConfig } from './config/update-config';
import { Output, OutputCustom } from './console-output';
import { PackageJson } from './model/packagejson.model';
import { TextEn } from './model/text-en';
import { filterDependancies, getAngularMayorVersion, gitSync, loadPackageJson, npmSync, npxSync } from "./utility";
import { findTargetVersion } from './version-finder';



export async function stageAndCommitChanges(packageName: string, config: AngularUpdateConfig) {
  return await gitSync(packageName, config)
}

export async function updateAngular(packageJson: PackageJson, config: AngularUpdateConfig) {
  let updateCommand = [
    "ng",
    "update",
    `@angular/cli@${config.runtime.angularTargetVersion}`,
    `@angular/core@${config.runtime.angularTargetVersion}`,
  ];

  if (packageJson.dependencies && packageJson.dependencies['@angular/material'] ||
    packageJson.devDependencies && packageJson.devDependencies['@angular/material']) {
    updateCommand.push(`@angular/material@${config.runtime.angularTargetVersion}`);
  }
  updateCommand.push("--allow-dirty")

  npxSync(updateCommand);
  await stageAndCommitChanges("@angular/cli @angular/core", packageJson.updateThemAll);
}

export async function updatePackages(packages: string[], depType: string, config: AngularUpdateConfig) {
  OutputCustom.updatingNext(depType);
  for (const packageName of packages) {
    try {
      const targetVersion = await findTargetVersion(packageName, config.runtime.angularTargetVersion)
      OutputCustom.updateingPackage(packageName, targetVersion);
      npxSync(["ng", "update", packageName + targetVersion, "--allow-dirty"]);
    } catch (error) {
      if (error instanceof Error) {
        OutputCustom.updatePackageError(packageName, error);
      }
    }
  }
  const packageNames = packages.join(" ");
  await stageAndCommitChanges(packageNames, config);
}

export async function npmInstall() {
  Output.boldItalic("install Packages")
  try {
    npmSync(["install", "--strict-peer-deps"])
  } catch (error) {
    npmSync(["install", "--legacy-peer-deps"])
  }

}

export async function npmAuditFix(config: AngularUpdateConfig) {
  Output.boldItalic(TextEn.UP_STARTING_NPM_AUDIT);
  npmSync(["audit", "fix"])
  await stageAndCommitChanges("npm audit fix", config);
}

// This function is used to remove the versioning symbols (~ and ^) from the dependencies and devDependencies in a package.json file.

export function removeVersioningSymbols(filepath: string) {
  // Read the package.json file and parse it into a JavaScript object.
  const packageObj = JSON.parse(fs.readFileSync(filepath, "utf-8"));

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
export async function updateAll(config: AngularUpdateConfig) {

  const packageJson = loadPackageJson();
  packageJson.updateThemAll = config;

  const dependencies = filterDependancies(Object.keys(packageJson.dependencies), config.ignoreDependencies);
  const devDependencies = filterDependancies(Object.keys(packageJson.devDependencies), config.ignoreDevDependencies);

  await updateAngular(packageJson, config);
  await updatePackages(dependencies, "dependencies", config);
  await updatePackages(devDependencies, "devDependencies", config);


  if (config.removeVersioningSymbols) {
    removeVersioningSymbols("package.json");
  }

  await npmInstall();

  await npmAuditFix(config);
}


exports.updateAll = updateAll;
exports.updatePackages = updatePackages;