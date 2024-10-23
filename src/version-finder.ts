import axios from 'axios';

import * as fs from 'fs';
import path from 'node:path';


export async function findTargetVersion(packageName: string, targetAngularVersion: string): Promise<string> {
    if (isAngularPackage(packageName)) {
        return "@" + targetAngularVersion
    }
    if (hasAngularPeerDependency(packageName)) {
        const version = await findCompatibleVersion(packageName, targetAngularVersion) ?? ''
        return version
    }
    return ''

}

interface PackageMetadata {
    peerDependencies?: {
        [key: string]: string;
    };
    // Add other properties if needed based on the metadata structure you expect.
}
// Helper function to get compatible versions of a third-party library
async function findCompatibleVersion(packageName: string, targetAngularVersion: string) {
    try {
        const url = `https://registry.npmjs.org/${packageName}`;
        const response = await axios.get(url);
        const versions: Record<string, PackageMetadata> = response.data.versions;

        for (const [version, details] of Object.entries(versions)) {
            const peerDependencies = details.peerDependencies || {};
            if (peerDependencies["@angular/core"] && peerDependencies["@angular/core"].includes(targetAngularVersion)) {
                console.log(`Compatible version for ${packageName}: ${version}`);
                return "@" + version;
            }
        }

        console.warn(`No compatible version found for ${packageName} with Angular ${targetAngularVersion}`);
        return null;
    } catch (error: any) {
        console.error(`Error fetching versions for ${packageName}: ${error.message}`);
        return null;
    }
}

function isAngularPackage(packageName: string): boolean {
    return packageName.startsWith("@angular/");
}

function hasAngularPeerDependency(packageName: string): boolean {
    try {
        // Locate the package.json inside node_modules for the given package
        const packageJsonPath = findPackageJsonInNodeModules(packageName);

        if (!packageJsonPath) {
            console.warn(`Could not find package.json for ${packageName} in node_modules`);
            return false;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Check if the peerDependencies include Angular packages
        const peerDependencies = packageJson.peerDependencies || {};
        return Object.keys(peerDependencies).some(dep => dep.startsWith('@angular/'));
    } catch (error: any) {
        console.warn(`Could not check peer dependencies via Package.json for ${packageName}: ${error.message}`);
        return false;
    }
}

function findPackageJsonInNodeModules(packageName: string): string | null {
    // Construct the path to the package within node_modules
    let currentPath = path.join(__dirname, 'node_modules', packageName);

    // Traverse directories inside the package to find a package.json
    while (currentPath !== path.dirname(currentPath)) {
        const packageJsonPath = path.join(currentPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }

        // Check if there are further nested directories to explore
        const subdirectories = fs.readdirSync(currentPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(currentPath, dirent.name));

        for (const subdirectory of subdirectories) {
            const nestedPackageJson = path.join(subdirectory, 'package.json');
            if (fs.existsSync(nestedPackageJson)) {
                return nestedPackageJson;
            }
        }

        // Move up to the parent directory if no package.json found at current level
        currentPath = path.dirname(currentPath);
    }

    return null;
}

// Main function to identify Angular-dependent packages
export function getAngularDependentPackages(packages: string[]): string[] {
    return packages.filter(packageName => isAngularPackage(packageName) || hasAngularPeerDependency(packageName));
}