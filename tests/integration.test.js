const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

xdescribe('Integration Test: update-them-all', () => {
  const oldProjectPath = path.join(__dirname, 'old');
  const testEnvironmentPath = path.join(__dirname, 'test-environment');

  beforeEach(async () => {
    // Clean up the test-environment directory if it exists
    if (fs.existsSync(testEnvironmentPath)) {
        await fs.removeSync(testEnvironmentPath);
    }
    // Copy the old Angular project to the test-environment directory
    await fs.copySync(oldProjectPath, testEnvironmentPath);
    await exec("npm link update-them-all");
    // Run the library
    await exec('npx update-them-all');
  });

  afterEach(async() => {
    // Clean up the test-environment directory
    await fs.removeSync(testEnvironmentPath);
    await exec("npm unlink update-them-all");
  });

  it('should update all dependencies to the latest version', () => {
    const oldPackageJson = require(path.join(oldProjectPath, 'package.json'));
    const updatedPackageJson = require(path.join(testEnvironmentPath, 'package.json'));

    let atLeastOneIsBiggerDep = false;
    let atLeastOneIsBiggerDevDep = false;


    Object.keys(oldPackageJson.dependencies).forEach((dependency) => {
      const oldVersion = oldPackageJson.dependencies[dependency];
      const updatedVersion = updatedPackageJson.dependencies[dependency];
      if(isVersionDifferent){
        atLeastOneIsBiggerDep = true;
      }
      expect(isVersionGreaterThanOrEqual(updatedVersion, oldVersion)).toBeTruthy();
    });

    Object.keys(oldPackageJson.devDependencies).forEach((dependency) => {
      const oldVersion = oldPackageJson.devDependencies[dependency];
      const updatedVersion = updatedPackageJson.devDependencies[dependency];
      if(isVersionDifferent){
        atLeastOneIsBiggerDevDep = true;
      }
      expect(isVersionGreaterThanOrEqual(updatedVersion, oldVersion)).toBeTruthy();
    });

    expect(atLeastOneIsBiggerDep).toBeTruthy();
    expect(atLeastOneIsBiggerDevDep).toBeTruthy();
  });
});


function isVersionGreaterThanOrEqual(updatedVersion, oldVersion) {
    const normalizeVersion = (version) =>
      version.replace(/^[^0-9]*/, '').split('.').map(Number);
  
    const [major1, minor1, patch1] = normalizeVersion(updatedVersion);
    const [major2, minor2, patch2] = normalizeVersion(oldVersion);
  
    return (
        major1 > major2 ||
        (major1 === major2 && minor1 > minor2) ||
        (major1 === major2 && minor1 === minor2 && patch1 > patch2) ||
        (major1 === major2 && minor1 === minor2 && patch1 === patch2)
      );
  }

  function isVersionDifferent(updatedVersion, oldVersion) {
    return (
      !isVersionGreaterThanOrEqual(oldVersion, updatedVersion) &&
      !isVersionGreaterThanOrEqual(updatedVersion, oldVersion)
    );
  }