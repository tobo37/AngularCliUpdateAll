const { updateAll, updatePackagesFast, updatePackages } = require('../src/update-packages');
const { execAsync } = require('../src/utility');

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
    execAsync: jest.fn(),
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
    execAsync.mockResolvedValue();

    await updateAll();

    expect(execAsync).toHaveBeenCalledTimes(12);
    expect(execAsync).toHaveBeenCalledWith('ng update @angular/cli @angular/core');
    expect(execAsync).toHaveBeenCalledWith('npm audit fix');
  });

  test('updatePackagesFast calls execAsync with correct command', async () => {
    const packages = ['package1', 'package2', 'package3'];
    execAsync.mockResolvedValue();

    await updatePackagesFast(packages);

    expect(execAsync).toHaveBeenCalledTimes(3);
    expect(execAsync).toHaveBeenCalledWith('ng update package1 package2 package3');
  });

  test('updatePackages updates each package individually', async () => {
    const packages = ['package1', 'package2', 'package3'];
    execAsync.mockResolvedValue();

    await updatePackages(packages, 'dependencies');

    expect(execAsync).toHaveBeenCalledTimes(5);
    packages.forEach((packageName) => {
      expect(execAsync).toHaveBeenCalledWith(`ng update ${packageName} --allow-dirty`);
    });
  });

  test('updatePackages handles error when updating a package', async () => {
    const packages = ['package1', 'package2', 'package3'];
    execAsync
      .mockRejectedValueOnce(new Error('Error updating package1'))
      .mockResolvedValue();

    await updatePackages(packages, 'dependencies');

    expect(execAsync).toHaveBeenCalledTimes(5);
    packages.forEach((packageName) => {
      expect(execAsync).toHaveBeenCalledWith(`ng update ${packageName} --allow-dirty`);
    });
  });
});
