import cp from 'child_process';
import * as fs from 'fs';
import { PackageJson } from '../../src/model/packagejson.model';
import * as utils from '../../src/utility';
import { DefaultConfig } from '../../src/config/update-config';

jest.mock('fs');
jest.mock('child_process');

describe('filterDependancies', () => {

    it('should filter out ignored dependencies', () => {
        const dependencies: string[] = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies: string[] = ['dep2', 'dep3'];
        const filtered: string[] = utils.filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual(['dep1']);
    });

    it('should return all dependencies if ignore list is empty', () => {
        const dependencies: string[] = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies: string[] = [];
        const filtered: string[] = utils.filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual(dependencies);
    });

    it('should return an empty array if all dependencies are ignored', () => {
        const dependencies: string[] = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies: string[] = ['dep1', 'dep2', 'dep3'];
        const filtered: string[] = utils.filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual([]);
    });
});

describe('Testing npmSync, npxSync, gitSync functions', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('npmSync function should call the correct npm command', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' });
        utils.npmSync(['install']);
        expect(cp.spawnSync).toHaveBeenCalledWith('npm.cmd', ['install'], { stdio: 'inherit', shell: false });

        Object.defineProperty(process, 'platform', { value: 'darwin' });
        utils.npmSync(['install']);
        expect(cp.spawnSync).toHaveBeenCalledWith('npm', ['install'], { stdio: 'inherit', shell: false });
    });

    it('npxSync function should call the correct npx command', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' });
        utils.npxSync(['create-react-app']);
        expect(cp.spawnSync).toHaveBeenCalledWith('npx.cmd', ['create-react-app'], { stdio: 'inherit', shell: false });

        Object.defineProperty(process, 'platform', { value: 'darwin' });
        utils.npxSync(['create-react-app']);
        expect(cp.spawnSync).toHaveBeenCalledWith('npx', ['create-react-app'], { stdio: 'inherit', shell: false });
    });

});

describe('getAngularMayorVersion', () => {
    const mockPackageJson: PackageJson = {
        dependencies: {
            '@angular/core': '^10.1.6',
        },
        devDependencies: {},
        updateThemAll: DefaultConfig

    };

    const mockPackageJsonDev: PackageJson = {
        dependencies: {},
        devDependencies: {
            '@angular/core': '^9.0.2',
        },
        updateThemAll: DefaultConfig
    };

    const mockPackageJsonWithoutAngular: PackageJson = {
        dependencies: {},
        devDependencies: {},
        updateThemAll: DefaultConfig
    }
    test('returns mayor version when angular is in dependencies', () => {
        const result = utils.getAngularMayorVersion(mockPackageJson);
        expect(result).toBe('10');  // As per the mockPackageJson object
    });

    test('returns mayor version when angular is in devDependencies', () => {
        const result = utils.getAngularMayorVersion(mockPackageJsonDev);
        expect(result).toBe('9');  // As per the mockPackageJsonDev object
    });

    test('returns null when there is no angular in dependencies or devDependencies', () => {
        const result = utils.getAngularMayorVersion(mockPackageJsonWithoutAngular);
        expect(result).toBeNull();
    });
});

describe('loadPackages', () => {
    it('reads from the correct file and parses the JSON', () => {
        // Given
        const packageJson: PackageJson = {
            dependencies: {
                dep1: '1.0.0',
                dep2: '2.0.0',
                dep3: '3.0.0',
            },
            devDependencies: {
                devDep1: '1.0.0',
                devDep2: '2.0.0',
            },
            updateThemAll: {
                migrateAngularVersion: true,
                removeVersioningSymbols: false,
                ignoreDependencies: [],
                ignoreDevDependencies: [],
                autoCommitDuringUpdate: false
            }
        };
        (fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>).mockReturnValueOnce(JSON.stringify(packageJson));

        // When
        const result = utils.loadPackageJson();

        // Then
        expect(fs.readFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
        expect(result).toEqual(packageJson);
    });
});
