const { exec } = require("child_process");
const fs = require("fs");
const { execAsync, loadPackages } = require("../src/utility");

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

describe("execAsync", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("resolves with stdout and stderr on successful command execution", async () => {
    const command = "echo 'Hello, World!'";
    exec.mockImplementation((cmd, callback) => {
      callback(null, "Hello, World!", "");
    });

    const result = await execAsync(command);
    expect(exec).toHaveBeenCalledWith(command, expect.any(Function));
    expect(result).toEqual({ stdout: "Hello, World!", stderr: "" });
  });

  it("rejects with error on failed command execution", async () => {
    const command = "nonexistent-command";
    const error = new Error("Command not found");
    exec.mockImplementation((cmd, callback) => {
      callback(error, "", "");
    });

    await expect(execAsync(command)).rejects.toEqual(error);
    expect(exec).toHaveBeenCalledWith(command, expect.any(Function));
  });
});

describe("loadPackages", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads and parses package.json", () => {
    const packageJsonContent = {
      name: "sample-project",
      version: "1.0.0",
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(packageJsonContent));

    const result = loadPackages();
    expect(fs.readFileSync).toHaveBeenCalledWith("package.json", "utf-8");
    expect(result).toEqual(packageJsonContent);
  });
});
