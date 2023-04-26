const fs = require("fs");
const { exec } = require("child_process");

jest.mock("fs");
jest.mock("child_process");

fs.readFileSync.mockReturnValue(
  JSON.stringify({
    dependencies: { "package-1": "^1.0.0", "package-2": "^2.0.0" },
    devDependencies: { "dev-package-1": "^1.0.0" },
  })
);

exec.mockImplementation((command, callback) => {
  callback(null, { stdout: "success", stderr: "" });
});

// Import the script after setting up the mocks
const { updateAll, packageJson } = require("../index");

describe("updateAll", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update all packages", async () => {
    await updateAll();

    expect(exec).toHaveBeenCalledWith("ng update @angular/cli @angular/core", expect.any(Function));
    expect(exec).toHaveBeenCalledWith("git add .", expect.any(Function));
    expect(exec).toHaveBeenCalledWith("git diff --cached --quiet", expect.any(Function));
    expect(exec).toHaveBeenCalledWith("ng update package-1 package-2", expect.any(Function));
    expect(exec).toHaveBeenCalledWith("ng update dev-package-1", expect.any(Function));
    expect(exec).toHaveBeenCalledWith("npm audit fix", expect.any(Function));
  });

  test("packageJson should have correct content", () => {
    expect(packageJson).toEqual({
      dependencies: { "package-1": "^1.0.0", "package-2": "^2.0.0" },
      devDependencies: { "dev-package-1": "^1.0.0" },
    });
  });
});
