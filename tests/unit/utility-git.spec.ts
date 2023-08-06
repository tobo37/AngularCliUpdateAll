import simpleGit from 'simple-git';
import { AngularUpdateConfig } from '../../src/config/update-config';
import { Output, OutputCustom } from '../../src/console-output';
import { gitSync } from '../../src/utility';

jest.mock('simple-git');
jest.mock('../../src/console-output');

const config: AngularUpdateConfig = {
    keepAngularMajorVersion: true,
    removeVersioningSymbols: false,
    ignoreDependencies: [],
    ignoreDevDependencies: [],
    autoCommitDuringUpdate: true
}

describe('gitSync', () => {
    let mockGit;

    beforeEach(() => {
        mockGit = {
            add: jest.fn().mockReturnThis(),
            commit: jest.fn().mockResolvedValue({}),
        };
        (simpleGit as jest.MockedFunction<typeof simpleGit>).mockImplementation(() => mockGit);
        OutputCustom.gitAdd = jest.fn();
        Output.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call simpleGit and commit', async () => {
        const packageName = 'package-name';

        await gitSync(packageName, config);

        expect(simpleGit).toHaveBeenCalled();
        expect(OutputCustom.gitAdd).toHaveBeenCalledWith(packageName);
        expect(mockGit.add).toHaveBeenCalledWith('.');
        expect(mockGit.commit).toHaveBeenCalledWith(packageName);
        expect(OutputCustom.npmAuditError).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
        const packageName = 'package-name';
        const error = new Error('Mock error');
        mockGit.commit.mockRejectedValue(error);

        await gitSync(packageName, config);

        expect(simpleGit).toHaveBeenCalled();
        expect(OutputCustom.gitAdd).toHaveBeenCalledWith(packageName);
        expect(mockGit.add).toHaveBeenCalledWith('.');
        expect(mockGit.commit).toHaveBeenCalledWith(packageName);
    });
});


