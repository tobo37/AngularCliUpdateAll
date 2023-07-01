import * as utils from '../src/utility';
import * as fs from 'fs';

jest.mock('fs');

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

describe('loadConfig function', () => {

    beforeEach(() => {
        // Reset the modules to get a clean instance of fs for each test
        jest.resetModules();
    });

    it('returns parsed JSON when the file exists', () => {
        const fsSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('{"keepAngularMayorVersion": false, "removeVersioningSymbols": true, "ignoreDependencies": ["dep1"], "ignoreDevDependencies": ["devDep1"]}');
        const result = utils.loadConfig();
        expect(fsSpy).toHaveBeenCalled();
        expect(result.keepAngularMayorVersion).toBe(false);
        expect(result.removeVersioningSymbols).toBe(true);
        expect(result.ignoreDependencies).toEqual(["dep1"]);
        expect(result.ignoreDevDependencies).toEqual(["devDep1"]);
    });

    it('returns default JSON when the file does not exist', () => {
        const fsSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error(); });
        const result = utils.loadConfig();
        expect(fsSpy).toHaveBeenCalled();
        expect(result).toEqual({
            keepAngularMayorVersion: true,
            removeVersioningSymbols: false,
            ignoreDependencies: [],
            ignoreDevDependencies: [],
        });
    });
});
