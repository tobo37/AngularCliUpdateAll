import fs from 'fs-extra';
import { promisify } from 'util';
import { exec as childProcessExec } from 'child_process';
import semver from 'semver';
import * as path from 'path';

const exec = promisify(childProcessExec);

describe('Integration Test: update-them-all', () => {
  const testEnvironmentPath = path.join(__dirname, 'test-env');

  beforeEach(async () => {
    // Clean up the test-environment directory if it exists
    if (fs.existsSync(testEnvironmentPath)) {
      await fs.removeSync(testEnvironmentPath);
    }
    await exec("cd tests && npx npx @angular/cli@16.0.0 new test-env --skip-git --skip-tests");
    await exec("cd tests/test-env && npm link update-them-all");
    await exec("cd tests/test-env && node ../../src/postinstall-script.js");

  });

  afterEach(async () => {
    // Clean up the test-environment directory
    // await fs.removeSync(testEnvironmentPath);
    await exec("cd tests/test-env && npm unlink update-them-all");
  });

  it('should update all dependencies to the latest version', async () => {
    const testPathsPackageJson = path.join(testEnvironmentPath, 'package.json');
    const oldPackageJson = JSON.parse(fs.readFileSync(testPathsPackageJson, 'utf-8'));

    let atLeastOneIsBiggerDep = false;
    let atLeastOneIsBiggerDevDep = false;

    // Run the library
    await exec('cd tests/test-env && npx update-them-all');
    const updatedPackageJson = JSON.parse(fs.readFileSync(testPathsPackageJson, 'utf-8'));

    Object.keys(oldPackageJson.dependencies).forEach((dependency) => {
      const oldDep = oldPackageJson.dependencies[dependency];
      const updatedDep = updatedPackageJson.dependencies[dependency];
      if (isVersionDifferent(updatedDep, oldDep)) {
        atLeastOneIsBiggerDep = true;
      }
      expect(isVersionGreaterThanOrEqual(updatedDep, oldDep)).toBeTruthy();
    });

    Object.keys(oldPackageJson.devDependencies).forEach((dependency) => {
      const oldDep = oldPackageJson.devDependencies[dependency];
      const updatedDep = updatedPackageJson.devDependencies[dependency];
      if (isVersionDifferent(updatedDep, oldDep)) {
        atLeastOneIsBiggerDevDep = true;
      }
      expect(isVersionGreaterThanOrEqual(updatedDep, oldDep)).toBeTruthy();
    });

    expect(atLeastOneIsBiggerDep).toBeTruthy();
    expect(atLeastOneIsBiggerDevDep).toBeTruthy();
    expect(isAngularVersionGreater).toBeTruthy();
  });
});


//angular version is updated hihger than 16.0.0
function isAngularVersionGreater(newDep, oldDep) {
  const oldAngularVersion = oldDep['@angular/cli'].replace(/[\^~]/g, '');
  const updatedAngularVersion = newDep['@angular/cli'].replace(/[\^~]/g, '');
  console.log("old angular version is: " + oldAngularVersion + " and new angular version is: " + updatedAngularVersion)
  return semver.gt(updatedAngularVersion, oldAngularVersion)
}




function isVersionGreaterThanOrEqual(updatedVersion, oldVersion) {
  return semver.gte(updatedVersion.replace(/[\^~]/g, ''), oldVersion.replace(/[\^~]/g, ''));
}

function isVersionDifferent(updatedVersion, oldVersion) {
  return (
    semver.eq(updatedVersion.replace(/[\^~]/g, ''), oldVersion.replace(/[\^~]/g, ''))
  );
}