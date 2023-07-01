import * as fs from 'fs';
import * as path from 'path';
import { platform } from 'os';
import * as cp from "child_process";


function findProjectRoot(currentDir: string) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir && parentDir !== currentDir) {
        return findProjectRoot(parentDir);
    }
    return null;
}

function copyConfig() {
    const rootDir = findProjectRoot(__dirname);
    if (!rootDir) {
        console.error('Could not find project root');
        return;
    }
    const srcFile = path.join(__dirname, 'config', 'update-config.json');
    const destFile = path.join(rootDir, 'update-config.json');

    fs.copyFileSync(srcFile, destFile);
}

function makeItExecutable() {
    const isWindows = platform() === 'win32';
    const command = isWindows ? 'echo No action needed' : 'chmod +x ./src/cli.js';

    cp.spawnSync(command, { stdio: "inherit", shell: false });
}


copyConfig();
makeItExecutable();


