#!/usr/bin/env node

const jsonfile = require('jsonfile');
const { npmSync, npxSync, gitSync, loadPackages, loadConfig, filterDependancies } = require("./utility");



/**

 * Add and commit changes using Git.

 *

 * @param {string} packageName - The name of the package to include in the commit message.

 */

async function stageAndCommitChanges(packageName) {
  console.log(`git add / commit: ${packageName}`);

  try {
    await gitSync(["add", "."]);
    await gitSync(["diff", "--cached", "--quiet"]);
  } catch (error) {
    await gitSync(["commit", "-m", packageName]);
  }
}

async function updateAngular(keepAngularMayorVersion) {
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

async function updatePackages(packages, type) {
  console.log(`Updating ${type}:`);

  for (const packageName of packages) {
    try {
      await npxSync(["ng", "update", packageName, "--allow-dirty"]);
    } catch (error) {
      console.error(`Error updating ${packageName}: ${error.message}`);
    }
  }

  const packageNames = packages.join(" ");

  await stageAndCommitChanges(packageNames);
}

async function updatePackagesFast(packages) {
  console.log("cmd: update Packages fast");

  await npxSync(["ng", "update", ...packages]);

  const packageNames = packages.join(" ");
  await stageAndCommitChanges(packageNames);
}

async function npmAuditFix() {
  console.log("run npm fix audit");

  const cmd = "npm audit fix";

  try {
    await npmSync(["audit", "fix"])
    await stageAndCommitChanges("npm audit fix");
  } catch (error) {
    console.error("Error running npm audit fix:", error.message);
  }
}

function removeVersionIcons(filepath) {
  jsonfile.readFile(filepath, function(err, packageObj) {
    if (err) console.error(err);

    const dependencies = packageObj.dependencies;
    const devDependencies = packageObj.devDependencies;

    // Modify dependencies
    for (const dep in dependencies) {
      if (dependencies.hasOwnProperty(dep)) {
        // Remove symbols
        dependencies[dep] = dependencies[dep].replace(/[~^]/g, '');
      }
    }

    // Modify devDependencies
    for (const dep in devDependencies) {
      if (devDependencies.hasOwnProperty(dep)) {
        // Remove symbols
        devDependencies[dep] = devDependencies[dep].replace(/[~^]/g, '');
      }
    }

    jsonfile.writeFile(filepath, packageObj, { spaces: 2 }, function (err) {
      if (err) console.error(err);
    });
  });
}

/**

 * Main function to update all packages.

 */

async function updateAll() {
  
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

  await updateAngular(config.keepAngularMayorVersion);
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