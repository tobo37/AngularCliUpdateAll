import { exec as childProcessExec } from 'child_process';
import fs from 'fs-extra';
import * as path from 'path';
import semver from 'semver';
import { promisify } from 'util';
import { removeVersioningSymbols } from '../../src/update-packages';
import { DefaultConfig } from '../../src/config/update-config';

const exec = promisify(childProcessExec);
const commandToGetGitStatus = 'git status --porcelain';

describe('Integration Test: update-them-all', () => {
  const testEnvironmentPath = path.join(__dirname, 'test-env');

  beforeAll(async () => {
    // Clean up the test-environment directory if it exists
    if (fs.existsSync(testEnvironmentPath)) {
      await fs.removeSync(testEnvironmentPath);
    }
    await exec("npm run prepublishOnly");
    await exec("cd tests && cd integration && npx @angular/cli@15.0.0 new test-env --skip-install --skip-tests --defaults=true");
    removeVersioningSymbols(path.join(testEnvironmentPath, 'package.json')); // downgrade from 15.9.9 to 15.0.0
    await exec("cd tests && cd integration && cd test-env && npm install --save-dev ../../../" + getPackedFileName());

  });

  afterAll(async () => {
    // Clean up the test-environment directory
    await fs.removeSync(testEnvironmentPath);
  });

  it('should update all dependencies to the latest version but stay on Angular Major', async () => {
    const testPathsPackageJson = path.join(testEnvironmentPath, 'package.json');
    const oldPackageJson = JSON.parse(fs.readFileSync(testPathsPackageJson, 'utf-8'));

    let atLeastOneIsBiggerDep = false;
    let atLeastOneIsBiggerDevDep = false;

    // Run the library
    await exec('cd tests && cd integration && cd test-env && npx update-them-all --add-config');
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
      if (dependency !== "update-them-all") {
        const oldDep = oldPackageJson.devDependencies[dependency];
        const updatedDep = updatedPackageJson.devDependencies[dependency];
        if (isVersionDifferent(updatedDep, oldDep)) {
          atLeastOneIsBiggerDevDep = true;
        }
        expect(isVersionGreaterThanOrEqual(updatedDep, oldDep)).toBeTruthy();
      }

    });
    const gitStatus = await getGitStatus()

    expect(atLeastOneIsBiggerDep).toBeTruthy();
    expect(atLeastOneIsBiggerDevDep).toBeTruthy();
    expect(isAngularVersionGreater(updatedPackageJson.devDependencies, oldPackageJson.devDependencies)).toBeTruthy();
    expect(gitStatus).toBe('')
  });

  it('should update all dependencies to the latest version', async () => {
    // Copy config & Change the keepAngularMajorVersion to false


    const testPathsPackageJson = path.join(testEnvironmentPath, 'package.json');
    const oldPackageJson = JSON.parse(fs.readFileSync(testPathsPackageJson, 'utf-8'));

    const config = DefaultConfig
    config.migrateAngularVersion = true;
    oldPackageJson.updateThemAll = config;
    fs.writeFileSync(testPathsPackageJson, JSON.stringify(oldPackageJson, null, 2), 'utf8');

    let atLeastOneIsBiggerDep = false;
    let atLeastOneIsBiggerDevDep = false;

    // Run the library
    await exec('cd tests && cd integration && cd test-env && npx update-them-all');
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
      if (dependency !== "update-them-all") {
        const oldDep = oldPackageJson.devDependencies[dependency];
        const updatedDep = updatedPackageJson.devDependencies[dependency];
        if (isVersionDifferent(updatedDep, oldDep)) {
          atLeastOneIsBiggerDevDep = true;
        }
        expect(isVersionGreaterThanOrEqual(updatedDep, oldDep)).toBeTruthy();
      }

    });
    const gitStatus = await getGitStatus()

    expect(atLeastOneIsBiggerDep).toBeTruthy();
    expect(atLeastOneIsBiggerDevDep).toBeTruthy();
    expect(isAngularVersionGreater(updatedPackageJson.devDependencies, oldPackageJson.devDependencies)).toBeTruthy();
    expect(gitStatus).toBe('')

  });
});


//angular version is updated hihger than 16.0.0
function isAngularVersionGreater(newDep: { [key: string]: string }, oldDep: { [key: string]: string }) {
  const oldAngularVersion = oldDep['@angular/cli'].replace(/[\^~]/g, '');
  const updatedAngularVersion = newDep['@angular/cli'].replace(/[\^~]/g, '');
  console.log("old angular version is: " + oldAngularVersion + " and new angular version is: " + updatedAngularVersion)
  return semver.gt(updatedAngularVersion, oldAngularVersion)
}




function isVersionGreaterThanOrEqual(updatedVersion: string, oldVersion: string) {
  return semver.gte(updatedVersion.replace(/[\^~]/g, ''), oldVersion.replace(/[\^~]/g, ''));
}

function isVersionDifferent(updatedVersion: string, oldVersion: string) {
  return (
    semver.neq(updatedVersion.replace(/[\^~]/g, ''), oldVersion.replace(/[\^~]/g, ''))
  );
}

function getPackedFileName(): string {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return `${packageJson.name}-${packageJson.version}.tgz`;
}

async function getGitStatus(): Promise<string> {
  return await exec(commandToGetGitStatus).then((result) => result.stdout);
}