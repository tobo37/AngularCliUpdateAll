const fs = require("fs");
const cp = require("child_process");

function npmSync(args, options = {}) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return cp.spawnSync(npmCommand, args, { stdio: "inherit", shell: false, ...options });
}

function npxSync(args, options = {}) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  return cp.spawnSync(npxCommand, args, { stdio: "inherit", shell: false, ...options });
}

function gitSync(args, options = {}) {
  const gitCommand = process.platform === "win32" ? "git.cmd" : "git";
  return cp.spawnSync(gitCommand, args, { stdio: "inherit", shell: false, ...options });
}

function loadPackages() {
  return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync('update-config.json', "utf-8"));
  } catch {
    console.log("no config file found, using default config")
    return {
      "keepAngularMayorVersion": true,
      "removeVersioningSymbols": false,
      "ignoreDependencies": [],
      "ignoreDevDependencies": []
    }
  }
}

function filterDependancies(dependencies, igonreDependencies) {
  return dependencies.filter((dep) => !igonreDependencies.includes(dep));
}

function getAngularMayorVersion(packageJson) {
  const angularVersion = packageJson.dependencies['@angular/core'] || packageJson.devDependencies['@angular/core'];
  if (!angularVersion) {
    return null;
  }
  const angularVersionNumber = angularVersion.replace(/[^0-9.]/g, '');
  const angularMayorVersion = angularVersionNumber.split('.')[0];
  return angularMayorVersion;
}

module.exports = { npmSync, npxSync, gitSync, loadPackages, loadConfig, filterDependancies, getAngularMayorVersion };
