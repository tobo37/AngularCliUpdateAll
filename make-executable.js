const fs = require("fs");
const path = require("path");

const entryFilePath = path.join(__dirname, "index.js");

fs.chmod(entryFilePath, 0o755, (err) => {
  if (err) {
    console.error("Failed to make index.js executable:", err.message);
    process.exit(1);
  } else {
    console.log("index.js is now executable");
  }
});
