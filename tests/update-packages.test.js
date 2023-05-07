const { updateAll, updatePackagesFast, updatePackages } = require('../src/update-packages');
const { npmSync, npxSync, gitSync } = require('../src/utility');

const packageJson = {
    dependencies: {
      dep1: '1.0.0',
      dep2: '2.0.0',
    },
    devDependencies: {
      devDep1: '1.0.0',
      devDep2: '2.0.0',
    },
  };

  const originalConsoleError = console.error;
console.error = jest.fn();

jest.mock('../src/utility', () => {
  return {
    npmSync: jest.fn(),
    npxSync: jest.fn(),
    gitSync: jest.fn(),
    loadPackages: jest.fn(() => packageJson),
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
    gitSync.mockResolvedValue()
    npxSync.mockResolvedValue()
    npmSync.mockResolvedValue()
    await updateAll();

    expect(gitSync).toHaveBeenCalledTimes(8);
    expect(npxSync).toHaveBeenCalledTimes(3);
    expect(npmSync).toHaveBeenCalledTimes(1);

    expect(npmSync).toHaveBeenCalledWith(["audit", "fix"]);
  });

  test('updatePackagesFast calls execAsync with correct command', async () => {
    const packages = ['package1', 'package2', 'package3'];
    npxSync.mockResolvedValue();

    await updatePackagesFast(packages);

    expect(npxSync).toHaveBeenCalledTimes(1);
    expect(npxSync).toHaveBeenCalledWith(["ng", "update", ...packages]);
  });

  test('updatePackages updates each package individually', async () => {
    const packages = ['package1', 'package2', 'package3'];
    npxSync.mockResolvedValue();

    await updatePackages(packages, 'dependencies');

    expect(npxSync).toHaveBeenCalledTimes(packages.length);
    packages.forEach((packageName) => {
      expect(npxSync).toHaveBeenCalledWith(["ng", "update", packageName, "--allow-dirty"]);
    });
  });

  test('updatePackages handles error when updating a package', async () => {
    const packages = ['package1', 'package2', 'package3'];
    npxSync
      .mockRejectedValueOnce(new Error('Error updating package1'))
      .mockResolvedValue();

    await updatePackages(packages, 'dependencies');

    expect(npxSync).toHaveBeenCalledTimes(packages.length);
    packages.forEach((packageName) => {
      expect(npxSync).toHaveBeenCalledWith(["ng", "update", packageName, "--allow-dirty"]);
    });
  });
});
