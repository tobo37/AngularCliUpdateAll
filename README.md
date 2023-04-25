# update-them-all - Keep your Angular project up to date

## Description

update-them-all is a convenient command-line tool and npm package designed to help you easily update all your npm dependencies, including Angular CLI and Angular Core, in your project. The package automatically stages and commits changes for each updated package or group of packages, providing a clean commit history and making it simple to track updates.

## Features:

- Automatically updates Angular CLI and Angular Core in your project.
- Updates all dependencies and devDependencies listed in your package.json file.
- Attempts to update multiple packages simultaneously when possible, falling back to updating one at a time if necessary.
- Stages and commits changes using Git after each successful package update, including a relevant commit message.
- Runs npm audit fix at the end of the update process to address any potential security vulnerabilities.

## Usage:

To use update-them-all as a command-line tool, simply run the following command in your project directory:

```bash
npm install update-them-all --save-dev
npx update-them-all
```

Alternatively, you can install the package globally and run the command:

```bash
npm install -g update-them-all
update-them-all
```

If you prefer to use update-them-all programmatically in your project, import the package and call the updateAll() function:

```javascript
const updateThemAll = require("update-them-all");

updateThemAll.updateAll()
  .then(() => {
    console.log("Packages updated successfully!");
  })
  .catch((error) => {
    console.error("Error updating packages:", error);
  });
```

With update-them-all, you can keep your npm dependencies up-to-date in a streamlined, organized, and efficient manner.
