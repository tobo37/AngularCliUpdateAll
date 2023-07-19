import cp from 'child_process';
import * as fs from 'fs';
import * as utils from '../../src/utility';
import { PackageJson } from '../../src/model/packagejson.model';

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

describe('loadConfigFile', () => {

    beforeEach(() => {
        // Reset the modules to get a clean instance of fs for each test
        jest.resetModules();
    });

    it('returns parsed JSON when the file exists', () => {
        const fsSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('{"keepAngularMayorVersion": false, "removeVersioningSymbols": true, "ignoreDependencies": ["dep1"], "ignoreDevDependencies": ["devDep1"]}');
        const result = utils.loadConfigFile();
        expect(fsSpy).toHaveBeenCalled();
        expect(result.keepAngularMayorVersion).toBe(false);
        expect(result.removeVersioningSymbols).toBe(true);
        expect(result.ignoreDependencies).toEqual(["dep1"]);
        expect(result.ignoreDevDependencies).toEqual(["devDep1"]);
    });

    it('returns default JSON when the file does not exist', () => {
        const fsSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error(); });
        const result = utils.loadConfigFile();
        expect(fsSpy).toHaveBeenCalled();
        expect(result).toEqual({
            keepAngularMayorVersion: true,
            removeVersioningSymbols: false,
            ignoreDependencies: [],
            ignoreDevDependencies: [],
        });
    });
});

describe('loadConfig', () => {
    let spyLoadConfigFile: jest.SpyInstance;

  beforeEach(() => {
    spyLoadConfigFile = jest.spyOn(utils, 'loadConfigFile');
  });

  afterEach(() => {
    spyLoadConfigFile.mockRestore();
  });

    it('should add angular dependencies to ignore lists when keepAngularMayorVersion is true', () => {
        // did not use the mockConfig! Just the default config
      const mockConfig = {
        keepAngularMayorVersion: true,
        ignoreDependencies: [],
        ignoreDevDependencies: [],
      };

      spyLoadConfigFile.mockReturnValue({mockConfig });
  
      const config = utils.loadConfig({dependencies: {"@angular/cli": "^0.0.0", "@angular/core": "~0.0.0"}, devDependencies: {"@angular/cli": "0.0.0", "@angular/core": "^0.0.0"}});

      expect(config.ignoreDependencies).toContain("@angular/cli");
      expect(config.ignoreDependencies).toContain("@angular/core");
      expect(config.ignoreDevDependencies).toContain("@angular/cli");
      expect(config.ignoreDevDependencies).toContain("@angular/core");
    });
  
    xit('should not add angular dependencies to ignore lists when keepAngularMayorVersion is false', () => {
      // did not use the mockConfig! Just the default config
      const mockConfig = {
        keepAngularMayorVersion: false,
        ignoreDependencies: [],
        ignoreDevDependencies: [],
      };
      spyLoadConfigFile.mockReturnValue(mockConfig);

      const config = utils.loadConfig({dependencies: {"@angular/cli": "^0.0.0", "@angular/core": "~0.0.0"}, devDependencies: {"@angular/cli": "0.0.0", "@angular/core": "^0.0.0"}});
  
      expect(config.ignoreDependencies).not.toContain("@angular/cli");
      expect(config.ignoreDependencies).not.toContain("@angular/core");
      expect(config.ignoreDevDependencies).not.toContain("@angular/cli");
      expect(config.ignoreDevDependencies).not.toContain("@angular/core");
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

    it('gitSync function should call the correct git command', () => {
        Object.defineProperty(process, 'platform', { value: 'darwin' });
        utils.gitSync(['clone', 'https://github.com/user/repo.git']);
        expect(cp.spawnSync).toHaveBeenCalledWith('git', ['clone', 'https://github.com/user/repo.git'], { stdio: 'inherit', shell: false });
    });
});



describe('getAngularMayorVersion', () => {
    const mockPackageJson = {
        dependencies: {
            '@angular/core': '^10.1.6',
        },
        devDependencies: {},
    };

    const mockPackageJsonDev = {
        dependencies: {},
        devDependencies: {
            '@angular/core': '^9.0.2',
        },
    };

    const mockPackageJsonWithoutAngular = {
        dependencies: {},
        devDependencies: {},
    };
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
      };
      (fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>).mockReturnValueOnce(JSON.stringify(packageJson));
  
      // When
      const result = utils.loadPackages();
  
      // Then
      expect(fs.readFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
      expect(result).toEqual(packageJson);
    });
  });
