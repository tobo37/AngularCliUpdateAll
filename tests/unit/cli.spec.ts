
import { updateAll } from "../../src/update-packages";
import * as cli from '../../src/cli'; // Update with the correct path
import { Output } from "../../src/console-output";
import { TextEn } from "../../src/model/text-en";

jest.mock('../../src/update-packages');
jest.mock('../../src/console-output');
jest.mock('../../src/model/text-en');

describe('npm package functions', () => {
  beforeEach(() => {
    // Reset all mock implementations before each test
    jest.clearAllMocks();
  });

  describe('handleArgs', () => {
    it('should call Output.simple if there are arguments', () => {
      const mockArgs = ['arg1'];
      cli.handleArgs(mockArgs);
      expect(Output.simple).toHaveBeenCalledWith(TextEn.CLI_INVALID_ARGS);
    });

    it('should not call Output.simple if there are no arguments', () => {
      const mockArgs: string[] = [];
      cli.handleArgs(mockArgs);
      expect(Output.simple).not.toHaveBeenCalled();
    });
  });

 describe('init', () => {
    it('should call updateAll and Output.greenBoldUnderline if updateAll is successful', async () => {
      const mockArgs: string[] = [];
      (updateAll as jest.Mock).mockResolvedValue(Promise.resolve('')); // Mock updateAll to resolve successfully
      await cli.init(mockArgs);
      expect(updateAll).toHaveBeenCalled();
      expect(Output.greenBoldUnderline).toHaveBeenCalledWith(TextEn.CLI_COMPLETE);
    });

    xit('should call Output.error if updateAll fails', async () => {
      const mockArgs: string[] = [];
      const mockError = new Error('Test error');
      const outputSpy = jest.spyOn(Output, 'error');
      (updateAll as jest.Mock).mockRejectedValue(Promise.reject(mockError)); // Mock updateAll to fail
      await cli.init(mockArgs);
      expect(updateAll).toHaveBeenCalled();
      expect(outputSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
