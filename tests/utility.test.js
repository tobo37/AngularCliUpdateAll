const { filterDependancies } = require('../src/utility');
const fs = require('fs');
jest.mock('fs');
describe('filterDependancies', () => {

    it('should filter out ignored dependencies', () => {
        const dependencies = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies = ['dep2', 'dep3'];
        const filtered = filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual(['dep1']);
    });

    it('should return all dependencies if ignore list is empty', () => {
        const dependencies = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies = [];
        const filtered = filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual(dependencies);
    });

    it('should return an empty array if all dependencies are ignored', () => {
        const dependencies = ['dep1', 'dep2', 'dep3'];
        const ignoreDependencies = ['dep1', 'dep2', 'dep3'];
        const filtered = filterDependancies(dependencies, ignoreDependencies);
        expect(filtered).toEqual([]);
    });
});

describe('loadConfig function', () => {
    let loadConfig;

    beforeEach(() => {
        // Reset the modules to get a clean instance of fs for each test
        jest.resetModules();

        loadConfig = require('../src/utility').loadConfig;
    });

    xit('returns parsed JSON when the file exists', () => {
        fs.readFileSync.mockReturnValue('{"keepAngularMayorVersion": false, "removeVersioningSymbols": true, "ignoreDependencies": ["dep1"], "ignoreDevDependencies": ["devDep1"]}');

        const result = loadConfig();

        expect(result.keepAngularMayorVersion).toBe(false);
        expect(result.removeVersioningSymbols).toBe(true);
        expect(result.ignoreDependencies).toEqual(["dep1"]);
        expect(result.ignoreDevDependencies).toEqual(["devDep1"]);
    });

    it('returns default JSON when the file does not exist', () => {
        fs.readFileSync.mockImplementation(() => { throw new Error(); });
        

        const result = loadConfig();

        expect(result).toEqual({
            keepAngularMayorVersion: true,
            removeVersioningSymbols: false,
            ignoreDependencies: [],
            ignoreDevDependencies: [],
        });
    });
});
