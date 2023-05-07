const { exec } = require("child_process");
const fs = require("fs");

function execAsync (command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

function loadPackages() {
    return JSON.parse(fs.readFileSync("package.json", "utf-8"));
}

module.exports = { execAsync, loadPackages };
