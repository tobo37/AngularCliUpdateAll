import * as fs from 'fs';
import { OutputCustom } from '../../src/console-output';
import { npmAuditFix, removeVersioningSymbols, stageAndCommitChanges, updateAll, updateAngular, updatePackages, updatePackagesFast } from '../../src/update-packages';
import * as utils from '../../src/utility';


const packageJson = {
  dependencies: {
    dep1: '1.0.0',
    dep2: '2.0.0',
    dep3: '3.0.0',
  },
  devDependencies: {
    devDep1: '1.0.0',
    devDep2: '2.0.0',
    devDep3: '3.2.1',
  },
};

const configJson = {
  ignoreDependencies: ['dep3'],
  ignoreDevDependencies: ['devDep2'],
}

const originalConsoleError = console.error;
console.error = jest.fn();

jest.mock('../../src/utility', () => {
  return {
    npmSync: jest.fn(),
    npxSync: jest.fn(),
    gitSync: jest.fn(),
    getAngularMayorVersion: jest.fn(() => '8'),
    filterDependancies: jest.fn((dependencies) => dependencies),
    loadPackages: jest.fn(() => packageJson),
    loadConfig: jest.fn(() => configJson),
  };
});

describe('updatePackages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  test('updateAll calls updateAngular, updatePackages, and npmAuditFix', async () => {

    const gitSpy = jest.spyOn(utils, 'gitSync');
    const npxSpy = jest.spyOn(utils, 'npxSync');
    const npmSpy = jest.spyOn(utils, 'npmSync');

    await updateAll();

    expect(gitSpy).toHaveBeenCalledTimes(8);
    expect(npxSpy).toHaveBeenCalledTimes(3);
    expect(npmSpy).toHaveBeenCalledTimes(1);

    expect(npmSpy).toHaveBeenCalledWith(["audit", "fix"]);
  });

  test('updatePackagesFast calls execAsync with correct command', async () => {
    const packages = ['package1', 'package2', 'package3'];
    const npxSpy = jest.spyOn(utils, 'npxSync');

    await updatePackagesFast(packages);

    expect(npxSpy).toHaveBeenCalledTimes(1);
    expect(npxSpy).toHaveBeenCalledWith(["ng", "update", ...packages]);
  });

  test('updatePackages updates each package individually', async () => {
    const packages = ['package1', 'package2', 'package3'];
    const npxSpy = jest.spyOn(utils, 'npxSync');

    await updatePackages(packages, 'dependencies');

    expect(npxSpy).toHaveBeenCalledTimes(packages.length);
    packages.forEach((packageName) => {
      expect(npxSpy).toHaveBeenCalledWith(["ng", "update", packageName, "--allow-dirty"]);
    });
  });

  test('updatePackages handles error when updating a package', async () => {
    const packages = ['package1', 'package2', 'package3'];
    const npxSpy = jest.spyOn(utils, 'npxSync').mockImplementationOnce(() => {
      throw new Error('Error updating package1');
    });


    await updatePackages(packages, 'dependencies');

    expect(npxSpy).toHaveBeenCalledTimes(packages.length);
    packages.forEach((packageName) => {
      expect(npxSpy).toHaveBeenCalledWith(["ng", "update", packageName, "--allow-dirty"]);
    });
  });
});


jest.mock('fs');

describe('removeVersioningSymbols', () => {
  it('should remove versioning symbols from dependencies and devDependencies', () => {
    const mockPackageJson = {
      dependencies: {
        'some-package': '^1.0.0',
        'another-package': '~1.0.0',
      },
      devDependencies: {
        'dev-package': '^1.0.0',
        'another-dev-package': '~1.0.0',
      },
    };

    // Mock the return value of fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockPackageJson));
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    removeVersioningSymbols('some/path/package.json');

    // Check that fs.readFileSync was called with the correct arguments
    expect(fs.readFileSync).toHaveBeenCalledWith('some/path/package.json', 'utf-8');

    const expectedPackageJson = {
      dependencies: {
        'some-package': '1.0.0',
        'another-package': '1.0.0',
      },
      devDependencies: {
        'dev-package': '1.0.0',
        'another-dev-package': '1.0.0',
      },
    }

    // Check that fs.writeFileSync was called with the correct arguments
    expect(fs.writeFileSync).toHaveBeenCalledWith('some/path/package.json', JSON.stringify(expectedPackageJson, null, 2));
  });
});

describe('updateAngular', () => {
  it('should update Angular to a specific version', async () => {
    const mockPackageJson = { dependencies: { '@angular/core': '8.1.1' }, devDependencies: { '@angular/cli': '8.1.1' } };

    await updateAngular(true, mockPackageJson);

    expect(utils.npxSync).toHaveBeenCalledWith(['ng', 'update', '@angular/cli@8', '@angular/core@8']);
  });

  it('should update Angular to the latest version', async () => {
    const mockPackageJson = { dependencies: { '@angular/core': '8.1.1' }, devDependencies: { '@angular/cli': '8.1.1' } };

    await updateAngular(false, mockPackageJson);

    expect(utils.npxSync).toHaveBeenCalledWith(['ng', 'update', '@angular/cli', '@angular/core']);
  });
});

describe('npmAuditFix', () => {
  it('should run npm audit fix', async () => {
    await npmAuditFix();

    expect(utils.npmSync).toHaveBeenCalledWith(['audit', 'fix']);
  });
});


describe('stageAndCommitChanges', () => {
  jest.mock('../../src/console-output', () => ({
    OutputCustom: {
      gitAdd: jest.fn(),
    },
  }));

  jest.mock('../../src/utility', () => ({
    gitSync: jest.fn(),
  }));

  it('should add and commit changes correctly', async () => {
    const packageName = 'test-package';
    const gitAddSpy = jest.spyOn(OutputCustom, 'gitAdd');
    const gitSyncSpy = jest.spyOn(utils, 'gitSync');

    await stageAndCommitChanges(packageName);

    expect(gitAddSpy).toHaveBeenCalledWith(packageName);
    expect(gitSyncSpy).toHaveBeenCalledWith(['add', '.']);
    expect(gitSyncSpy).toHaveBeenCalledWith(["commit", "-m", packageName]);

    gitAddSpy.mockRestore();
    gitSyncSpy.mockRestore();
  });

  xit('should commit changes when there are no changes to add', async () => {
    const packageName = 'test-package';
    const gitAddSpy = jest.spyOn(OutputCustom, 'gitAdd');
    const gitSyncSpy = jest.spyOn(utils, 'gitSync').mockImplementationOnce(() => {
      throw new Error('Error adding changes');
    });

    await stageAndCommitChanges(packageName);

    expect(gitAddSpy).toHaveBeenCalledWith(packageName);
    expect(gitSyncSpy).toHaveBeenCalledWith(['add', '.']);
    expect(gitSyncSpy).toHaveBeenCalledWith(['commit', '-m', packageName]);

    gitAddSpy.mockRestore();
    gitSyncSpy.mockRestore();
  });
});