const fs = require("fs");

const { exec } = require("child_process");

const util = require("util");

const execAsync = util.promisify(exec);

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

/**

 * Add and commit changes using Git.

 *

 * @param {string} packageName - The name of the package to include in the commit message.

 */

async function stageAndCommitChanges(packageName) {
  console.log(`git add / commit: ${packageName}`);

  const cmdAdd = "git add .";

  try {
    await execAsync(cmdAdd);

    const cmdCheckChanges = "git diff --cached --quiet";

    await execAsync(cmdCheckChanges);
  } catch (error) {
    const cmdCommit = `git commit -m "${packageName}"`;

    await execAsync(cmdCommit);
  }
}

async function updateAngular() {
  console.log("cmd: update @angular/cli @angular/core");

  const cmd = "ng update @angular/cli @angular/core";

  await execAsync(cmd);

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
    const cmd = `ng update ${packageName} --allow-dirty`;

    console.log(`cmd: update: ${packageName}`);

    try {
      await execAsync(cmd);
    } catch (error) {
      console.error(`Error updating ${packageName}: ${error.message}`);
    }
  }

  const packageNames = packages.join(" ");

  await stageAndCommitChanges(packageNames);
}

async function updatePackagesFast(packages) {
  console.log("cmd: update Packages fast");

  const packageNames = packages.join(" ");

  const cmd = `ng update ${packageNames}`;

  console.log(`cmd: ${cmd}`);

  await execAsync(cmd);

  await stageAndCommitChanges(packageNames);
}

async function npmAuditFix() {
  console.log("run npm fix audit");

  const cmd = "npm audit fix";

  try {
    await execAsync(cmd);

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
