#!/usr/bin/env node


const { npmSync, npxSync, gitSync, loadPackages } = require("./utility");



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

async function updateAngular() {
  await npxSync(["ng", "update", "@angular/cli", "@angular/core"]);

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

/**

 * Main function to update all packages.

 */

async function updateAll() {
  await updateAngular();
  const packageJson = loadPackages()

  const dependencies = Object.keys(packageJson.dependencies);

  const devDependencies = Object.keys(packageJson.devDependencies);

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

  await npmAuditFix();
}

// exports.modules = {updateAll, updatePackagesFast, updatePackages }
exports.updateAll = updateAll;
exports.updatePackagesFast = updatePackagesFast;
exports.updatePackages = updatePackages;