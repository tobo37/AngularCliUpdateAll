import { updateAll, updatePackagesFast, updatePackages } from '../src/update-packages';
import * as utils from '../src/utility';

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

jest.mock('../src/utility', () => {
  return {
    npmSync: jest.fn(),
    npxSync: jest.fn(),
    gitSync: jest.fn(),
    filterDependancies: jest.fn((dependencies, ignoreDependencies) => dependencies),
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
