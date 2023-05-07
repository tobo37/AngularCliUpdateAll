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

function gitSync(args, options = {}){
    const gitCommand = process.platform === "win32" ? "git.cmd" : "git";
  return cp.spawnSync(gitCommand, args, { stdio: "inherit", shell: false, ...options });
}

function loadPackages() {
    return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

module.exports = { npmSync, npxSync, gitSync, loadPackages };
