#!/usr/bin/env node

import * as jsonfile from 'jsonfile';
import { npmSync, npxSync, gitSync, loadPackages, loadConfig, filterDependancies, getAngularMayorVersion } from "./utility";
import { packageJson } from './model/packagejson.model';



/**

 * Add and commit changes using Git.

 *

 * @param {string} packageName - The name of the package to include in the commit message.

 */

async function stageAndCommitChanges(packageName: string) {
  console.log(`git add / commit: ${packageName}`);

  try {
    await gitSync(["add", "."]);
    await gitSync(["diff", "--cached", "--quiet"]);
  } catch (error) {
    await gitSync(["commit", "-m", packageName]);
  }
}

async function updateAngular(keepAngularMayorVersion: boolean, packageJson: packageJson) {
  if(keepAngularMayorVersion) {
    const angularVersion = getAngularMayorVersion(packageJson);
    await npxSync(["ng", "update", `@angular/cli@${angularVersion}`, `@angular/core@${angularVersion}`]);
  } else {
    await npxSync(["ng", "update", "@angular/cli", "@angular/core"]);
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
      await npxSync(["ng", "update", packageName, "--allow-dirty"]);
    } catch (error) {
      console.error(`Error updating ${packageName}: ${error}`);
    }
  }

  const packageNames = packages.join(" ");

  await stageAndCommitChanges(packageNames);
}

export async function updatePackagesFast(packages: string[]) {
  console.log("cmd: update Packages fast");

  await npxSync(["ng", "update", ...packages]);

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

function removeVersionIcons(filepath: string) {
  jsonfile.readFile(filepath, function(err, packageObj: packageJson) {
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
        return;
      }
    });
  });
}

/**

 * Main function to update all packages.

 */

export async function updateAll() {
  
  const packageJson = loadPackages()
  const config = loadConfig();

  if(config.keepAngularMayorVersion){
    config.ignoreDependencies.push("@angular/cli");
    config.ignoreDependencies.push("@angular/core");
    config.ignoreDevDependencies.push("@angular/cli");
    config.ignoreDevDependencies.push("@angular/core");
  }

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

// exports.modules = {updateAll, updatePackagesFast, updatePackages }
exports.updateAll = updateAll;
exports.updatePackagesFast = updatePackagesFast;
exports.updatePackages = updatePackages;