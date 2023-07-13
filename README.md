# update-them-all - Keep your Angular project up to date

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tobo37_AngularCliUpdateAll&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=tobo37_AngularCliUpdateAll) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=tobo37_AngularCliUpdateAll&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=tobo37_AngularCliUpdateAll) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=tobo37_AngularCliUpdateAll&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=tobo37_AngularCliUpdateAll) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tobo37_AngularCliUpdateAll&metric=coverage)](https://sonarcloud.io/summary/new_code?id=tobo37_AngularCliUpdateAll) [![Socket Badge](https://socket.dev/api/badge/npm/package/update-them-all)](https://socket.dev/npm/package/update-them-all)[![codecov](https://codecov.io/gh/tobo37/AngularCliUpdateAll/branch/master/graph/badge.svg?token=XIPVEUIGY2)](https://codecov.io/gh/tobo37/AngularCliUpdateAll)

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

## Recommendation:
Create a new branch like "update date[xy]" and then run the script

```bash
npx update-them-all
```
The branch must be clean

## How does it work?
The first step is an update of Angular
```bash
ng update @angular/cli @angular/core
```
Then try to update all dependancys and DevDependancys as oneliner with 
```bash
ng update [x] [y] [z] [...]
```
If the step does not work, then ng update is performed per dependency.

The last step is 
```bash
npm audit fix
```
between each step a git Commit is done, because "ng update" needs a clean branch.
With update-them-all, you can keep your npm dependencies up-to-date in a streamlined, organized, and efficient manner.
