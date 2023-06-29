const fs = require('fs');
const path = require('path');
const { platform } = require('os');
const { exec } = require('child_process');


function findProjectRoot(currentDir) {
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
    const srcFile = path.join(__dirname, 'config', 'update-config.json');
    const destFile = path.join(rootDir, 'update-config.json');

    fs.copyFileSync(srcFile, destFile);
}

function makeItExecutable() {
    const isWindows = platform() === 'win32';
    const command = isWindows ? 'echo No action needed' : 'chmod +x ./src/cli.js';

    exec(command, (error) => {
        if (error) {
            console.error(`Failed to set permissions: ${error.message}`);
        } else {
            console.log('Permissions set successfully.');
        }
    });
}


copyConfig();
makeItExecutable();


