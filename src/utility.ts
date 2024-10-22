import * as cp from "child_process";
import * as fs from 'fs';
import simpleGit from "simple-git";
import { AngularUpdateConfig } from "./config/update-config";
import { Output, OutputCustom } from "./console-output";
import { PackageJson } from "./model/packagejson.model";
import { TextEn } from "./model/text-en";

// Synchronous npm command execution with improved error handling
export function npmSync(args: string[]) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = cp.spawnSync(npmCommand, args, { stdio: "inherit", shell: true });

  if (result.error) {
    Output.error(`npmSync failed with error: ${result.error.message}`);
  }
  return result;
}

// Synchronous npx command execution with improved error handling
export function npxSync(args: string[]) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = cp.spawnSync(npxCommand, args, { stdio: "inherit", shell: true });

  if (result.error) {
    Output.error(`npxSync failed with error: ${result.error.message}`);
  }
  return result;
}


// Git synchronization with asynchronous handling
export async function gitSync(packageName: string, config: AngularUpdateConfig) {
  if (!config.autoCommitDuringUpdate) {
    Output.yellow(TextEn.UP_GIT_SKIP);
    return;
  }

  const git = simpleGit();
  OutputCustom.gitAdd(packageName);

  try {
    await git.add(".");  // Stage changes
    await git.commit(packageName);  // Commit staged changes
  } catch (error) {
    if (error instanceof Error) {
      Output.error(`Git commit failed: ${error.message}`);
    }
  }
}

// Load package.json file and parse it
export function loadPackageJson(): PackageJson {
  try {
    const data = fs.readFileSync("package.json", "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    Output.error(`Failed to load package.json: ${error.message}`);
    throw error;  // Re-throwing to ensure calling functions handle the error
  }
}

// Save updated package.json file
export function savePackageJson(packageJson: PackageJson) {
  try {
    const jsonString = JSON.stringify(packageJson, null, 2);
    fs.writeFileSync("package.json", jsonString, 'utf8');
  } catch (error: any) {
    Output.error(`Failed to save package.json: ${error.message}`);
  }
}

// Add or update configuration in the package.json file
export function addOrUpdateConfigToPackageJson(packageJson: PackageJson, config: AngularUpdateConfig) {
  packageJson.updateThemAll = config;
  savePackageJson(packageJson);
}

// Filter dependencies to exclude ignored ones
export function filterDependancies(dependencies: string[], ignoreDependencies: string[]) {
  return dependencies.filter((dep) => !ignoreDependencies.includes(dep));
}

// Get major version of Angular from package.json dependencies
export function getAngularMayorVersion(packageJson: PackageJson) {
  const angularVersion = packageJson.dependencies?.['@angular/core'] || packageJson.devDependencies?.['@angular/core'];
  if (!angularVersion) {
    return null;
  }

  // Extract numeric version and retrieve the major version part
  const angularVersionNumber = angularVersion.replace(/[^0-9.]/g, '');
  const angularMayorVersion = angularVersionNumber.split('.')[0];
  return angularMayorVersion;
}
