import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import * as readline from 'node:readline';
import { AngularUpdateConfig, DefaultConfig } from "./config/update-config";
import { Output } from "./console-output";

export async function askForConfig() {
    let config = DefaultConfig;
    await askAngularMigration(config);
    await askRemoveVersioningSymbols(config);
    // await askIgnoreDependencies(config);
    // await askIgnoreDevDependencies(config);
    await askAutoCommit(config);
    return config;
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function askAngularMigration(config: AngularUpdateConfig) {
    try {
        // Read and parse the package.json file to get the current Angular version
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const currentAngularVersion = packageJson.dependencies['@angular/core']?.match(/(\d+)\./)?.[1];

        if (!currentAngularVersion) {
            throw new Error("Unable to find the Angular version in package.json dependencies.");
        }

        // Get the latest Angular version available from npm
        const versionRaw = await execPromise('npm view @angular/core version');
        const versionString = typeof versionRaw === 'string' ? versionRaw : '';
        const latestAngularVersion = versionString.split('.')[0];
        config.runtime.angularCurrentVersion = currentAngularVersion
        config.runtime.angularTargetVersion = currentAngularVersion
        // Check if a new major version is available
        if (latestAngularVersion && parseInt(latestAngularVersion) > parseInt(currentAngularVersion)) {
            const answer = await askQuestion(
                `🚀 A new major version of Angular is available (v${latestAngularVersion}). Would you like to migrate one major version up? (yes/no default): `
            );

            if (['yes', 'y'].includes(answer.trim().toLowerCase())) {
                const nextVersion = parseInt(currentAngularVersion) + 1;
                Output.greenBoldUnderline(`✔️ Migrating Angular to v${nextVersion}...`);

                if (nextVersion < parseInt(latestAngularVersion)) {
                    Output.yellow(`⚠️ Multiple updates required to reach the latest version (v${latestAngularVersion}). Consider repeating the migration.`);
                }

                config.migrateAngularVersion = true;
                config.runtime.angularTargetVersion = nextVersion.toString()

            } else {
                Output.greenBoldUnderline("✔️ Staying on the current version.");
            }
        } else {
            Output.greenBoldUnderline("✔️ You are already using the latest major version.");
        }
    } catch (error: any) {
        Output.error(`❌ Migration check failed: ${error.message}`);
    }
}


async function askRemoveVersioningSymbols(config: AngularUpdateConfig) {
    const answer = await askQuestion(
        `Should VersioningSymbols (~ ^) be removed? (yes/no default): `
    );

    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        Output.greenBoldUnderline(`Versioning symbols will be removed.`);
        config.removeVersioningSymbols = true;
    } else {
        Output.greenBoldUnderline("Versioning symbols will remain untouched.");
    }
}

async function askIgnoreDependencies(config: AngularUpdateConfig) {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});

    await selectItems(
        "Select dependencies to ignore (Press space to select, enter to confirm): ",
        dependencies,
        (selectedDependencies) => {
            config.ignoreDependencies = selectedDependencies;
            Output.greenBoldUnderline("Ignored dependencies: " + selectedDependencies.join(", "));
        }
    );
}

async function askIgnoreDevDependencies(config: AngularUpdateConfig) {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    await selectItems(
        "Select devDependencies to ignore (Press space to select, enter to confirm): ",
        devDependencies,
        (selectedDevDependencies) => {
            config.ignoreDevDependencies = selectedDevDependencies;
            Output.greenBoldUnderline("Ignored devDependencies: " + selectedDevDependencies.join(", "));
        }
    );
}

async function askAutoCommit(config: AngularUpdateConfig) {
    const answer = await askQuestion(
        `Should auto-commit be enabled during the update? (yes/no default): `
    );

    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        Output.greenBoldUnderline("Auto-commit will be enabled.");
        config.autoCommitDuringUpdate = true;
    } else {
        Output.greenBoldUnderline("Auto-commit will remain disabled.");
    }
}

const execPromise = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve(stdout);
            }
        });
    });
};

function selectItems(prompt: string, items: string[], callback: (selectedItems: string[]) => void): Promise<void> {
    return new Promise((resolve) => {
        const selectedItems = new Set<string>();
        let currentIndex = 0;

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        function displayItems() {
            console.clear();
            console.log(prompt);
            items.forEach((item, index) => {
                const prefix = selectedItems.has(item) ? "[x]" : "[ ]";
                console.log(`${index === currentIndex ? ">" : " "} ${prefix} ${item}`);
            });
        }

        function handleKeyPress(chunk: Buffer, key: any) {
            if (key?.name === "space") {
                const currentItem = items[currentIndex];
                if (selectedItems.has(currentItem)) {
                    selectedItems.delete(currentItem);
                } else {
                    selectedItems.add(currentItem);
                }
                displayItems();
            } else if (key?.name === "return") {
                process.stdin.setRawMode(false);
                rl.close();
                callback(Array.from(selectedItems));
                resolve();
            } else if (key?.name === "up") {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                displayItems();
            } else if (key?.name === "down") {
                currentIndex = (currentIndex + 1) % items.length;
                displayItems();
            }
        }

        process.stdin.on("data", handleKeyPress);
        displayItems();

        rl.on("close", () => {
            process.stdin.removeListener("data", handleKeyPress);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
        });
    });
}
