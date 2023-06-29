const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const semver = require('semver');

describe('Integration Test: update-them-all', () => {
  const testEnvironmentPath = path.join(__dirname, 'test-env');

  beforeEach(async () => {
    // Clean up the test-environment directory if it exists
    if (fs.existsSync(testEnvironmentPath)) {
        await fs.removeSync(testEnvironmentPath);
    }
    await exec("cd tests && npx npx @angular/cli@16.0.0 new test-env --skip-git --skip-tests");
    await exec("npm link update-them-all");
    
  });

  afterEach(async() => {
    // Clean up the test-environment directory
    await fs.removeSync(testEnvironmentPath);
    await exec("npm unlink update-them-all");
  });

  it('should update all dependencies to the latest version', async () => {
    const oldPackageJson = require(path.join(testEnvironmentPath, 'package.json'));
    

    let atLeastOneIsBiggerDep = false;
    let atLeastOneIsBiggerDevDep = false;

    // Run the library
    await exec('npx update-them-all');
    const updatedPackageJson = require(path.join(testEnvironmentPath, 'package.json'));

    Object.keys(oldPackageJson.dependencies).forEach((dependency) => {
      const oldDep = oldPackageJson.dependencies[dependency];
      const updatedDep = updatedPackageJson.dependencies[dependency];
      if(isVersionDifferent(updatedDep, oldDep)){
        atLeastOneIsBiggerDep = true;
      }
      expect(isVersionGreaterThanOrEqual(updatedDep, oldDep)).toBeTruthy();
    });

    Object.keys(oldPackageJson.devDependencies).forEach((dependency) => {
      const oldDep = oldPackageJson.devDependencies[dependency];
      const updatedDep = updatedPackageJson.devDependencies[dependency];
      if(isVersionDifferent){
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