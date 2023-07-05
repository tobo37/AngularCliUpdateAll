import { updateAll } from "../src/update-packages";
import {handleArgs} from "../src/cli";

// Mocking updateAll function from update-packages module
jest.mock('../src/update-packages', () => {
  return {
    updateAll: jest.fn(() => new Promise((resolve) => resolve(null))),
  };
});

describe('cli tests', () => {
    let log: jest.SpyInstance;
  
  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => "");
  });
  afterEach(() => {
    log.mockRestore();
  });
  it('should call init when the cli.ts module is loaded', async () => {
    await jest.isolateModules(async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cli = require('../src/cli');
      expect(updateAll).toHaveBeenCalled();
    });
  });

  it('logs a message if there are command-line arguments', () => {
    handleArgs(['arg1']);
    expect(log).toHaveBeenCalledWith("Invalid arguments - we don't take any arguments (yet)");
  });

  it('does not log a message if there are no command-line arguments', () => {
    handleArgs([]);
    expect(log).not.toHaveBeenCalled();
  });
});
