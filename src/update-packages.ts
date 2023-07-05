#!/usr/bin/env node

import * as jsonfile from 'jsonfile';
import { PackageJson } from './model/packagejson.model';
import { filterDependancies, getAngularMayorVersion, gitSync, loadConfig, loadPackages, npmSync, npxSync } from "./utility";



/**

 * Add and commit changes using Git.

 *

 * @param {string} packageName - The name of the package to include in the commit message.

 */

async function stageAndCommitChanges(packageName: string) {
  console.log(`git add / commit: ${packageName}`);

  try {
    gitSync(["add", "."]);
    gitSync(["diff", "--cached", "--quiet"]);
  } catch (error) {
    gitSync(["commit", "-m", packageName]);
  }
}

async function updateAngular(keepAngularMayorVersion: boolean, packageJson: PackageJson) {
  if(keepAngularMayorVersion) {
    const angularVersion = getAngularMayorVersion(packageJson);
    npxSync(["ng", "update", `@angular/cli@${angularVersion}`, `@angular/core@${angularVersion}`]);
  } else {
    npxSync(["ng", "update", "@angular/cli", "@angular/core"]);
  }
  await stageAndCommitChanges("@angular/cli @angular/core");
}

/**

 * Update a list of packages.

 *

 * @param {Array<string>} packages - An array of package names.

 * @param {string} type - The type of packages ('dependencies' or 'devDependencies').

 */

export async function updatePackages(packages: string[], type: string) {
  console.log(`Updating ${type}:`);

  for (const packageName of packages) {
    try {
      npxSync(["ng", "update", packageName, "--allow-dirty"]);
    } catch (error) {
      console.error(`Error updating ${packageName}: ${error}`);
    }
  }

  const packageNames = packages.join(" ");

  await stageAndCommitChanges(packageNames);
}

export async function updatePackagesFast(packages: string[]) {
  console.log("cmd: update Packages fast");

  npxSync(["ng", "update", ...packages]);

  const packageNames = packages.join(" ");
  await stageAndCommitChanges(packageNames);
}

async function npmAuditFix() {
  console.log("npm audit fix");

  try {
    npmSync(["audit", "fix"])
    await stageAndCommitChanges("npm audit fix");
  } catch (error) {
    console.error("Error running npm audit fix:", error);
  }
}

export function removeVersionIcons(filepath: string) {
  jsonfile.readFile(filepath, function(err, packageObj: PackageJson) {
    if (err) {
      console.error(err);
      return;
    }

    const dependencies = packageObj.dependencies;
    const devDependencies = packageObj.devDependencies;

    // Modify dependencies
    for (const dep in dependencies) {
      dependencies[dep] = dependencies[dep].replace(/[~^]/g, '');
    }

    // Modify devDependencies
    for (const dep in devDependencies) {
      // Remove symbols
      devDependencies[dep] = devDependencies[dep].replace(/[~^]/g, '');
    }

    jsonfile.writeFile(filepath, packageObj, { spaces: 2 }, function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
}

/**

 * Main function to update all packages.

 */

export async function updateAll() {
  
  const packageJson = loadPackages();
  const config = loadConfig();

  const dependencies = filterDependancies(Object.keys(packageJson.dependencies), config.ignoreDependencies);
  const devDependencies = filterDependancies(Object.keys(packageJson.devDependencies), config.ignoreDevDependencies);

  await updateAngular(config.keepAngularMayorVersion, packageJson);
  try {
    await updatePackagesFast(dependencies);
  } catch {
    console.log("All dependencies at once is not possible. Try one at a time.");

    await updatePackages(dependencies, "dependencies");
  }

  try {
    await updatePackagesFast(devDependencies);
  } catch {
    console.log(
      "All dependencies at once is not possible. Try one at a time."
    );

    await updatePackages(devDependencies, "devDependencies");
  }

  if(config.removeVersionIcons) {
    removeVersionIcons("package.json");
  }

  await npmAuditFix();
}


exports.updateAll = updateAll;
exports.updatePackagesFast = updatePackagesFast;
exports.updatePackages = updatePackages;