import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import * as readline from 'node:readline';
import { Output } from "./console-output";
import { AngularUpdateConfig } from "./config/update-config";

const defaultConfig = {
    migrateAngularVersion: false,
    removeVersioningSymbols: false,
    ignoreDependencies: [],
    ignoreDevDependencies: [],
    autoCommitDuringUpdate: false
}

export function askForConfig() {
    let config = defaultConfig;
    askAngularMigration(config);
    askRemoveVersioningSymbols(config);
    askIgnoreDependencies(config);
    askIgnoreDevDependencies(config);
    askAutoCommit(config);
    return config;
}

function askAngularMigration(config: AngularUpdateConfig) {
    try {
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const currentAngularVersion = packageJson.dependencies['@angular/core']?.match(/(\d+)\./)?.[1];

        if (!currentAngularVersion) {
            throw new Error("Angular version not found in package.json dependencies.");
        }

        exec('npm outdated @angular/core --json', (err, stdout, stderr) => {
            if (err || stderr) {
                Output.error("Failed to check for outdated Angular version.");
                return;
            }

            const outdatedData = JSON.parse(stdout || '{}');
            const latestAngularVersion = outdatedData['@angular/core']?.latest?.match(/(\d+)\./)?.[1];

            if (latestAngularVersion && parseInt(latestAngularVersion) > parseInt(currentAngularVersion)) {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                rl.question(
                    `A new major version of Angular is available: ${latestAngularVersion}. Would you like to perform a migration (+1) major Version? (yes/no default): `,
                    (answer) => {
                        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                            Output.greenBoldUnderline(`Angular migrate to ${currentAngularVersion + 1}`);
                            if (parseInt(currentAngularVersion) + 1 < parseInt(latestAngularVersion)) {
                                Output.yellow("Repeat the migration to reach " + latestAngularVersion);
                            }
                            config.migrateAngularVersion = true;
                        } else {
                            Output.greenBoldUnderline("Staying on the current version.");
                        }
                        rl.close();
                    }
                );
            } else {
                Output.greenBoldUnderline("No major updates detected.");
            }
        });
    } catch (error: any) {
        Output.error(error.message);
    }
}

function askRemoveVersioningSymbols(config: AngularUpdateConfig) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(
        `Should VersioningSymbols (~ ^) be removed? (yes/no default): `,
        (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                Output.greenBoldUnderline(`Versioning symbols will be removed.`);
                config.removeVersioningSymbols = true;
            } else {
                Output.greenBoldUnderline("Versioning symbols will remain untouched.");
            }
            rl.close();
        }
    );
}

function askIgnoreDependencies(config: AngularUpdateConfig) {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});

    selectItems(
        "Select dependencies to ignore (Press space to select, enter to confirm): ",
        dependencies,
        (selectedDependencies) => {
            config.ignoreDependencies = selectedDependencies;
            Output.greenBoldUnderline("Ignored dependencies: " + selectedDependencies.join(", "));
        }
    );
}

function askIgnoreDevDependencies(config: AngularUpdateConfig) {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    selectItems(
        "Select devDependencies to ignore (Press space to select, enter to confirm): ",
        devDependencies,
        (selectedDevDependencies) => {
            config.ignoreDevDependencies = selectedDevDependencies;
            Output.greenBoldUnderline("Ignored devDependencies: " + selectedDevDependencies.join(", "));
        }
    );
}

function askAutoCommit(config: AngularUpdateConfig) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(
        `Should auto-commit be enabled during the update? (yes/no default): `,
        (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                Output.greenBoldUnderline("Auto-commit will be enabled.");
                config.autoCommitDuringUpdate = true;
            } else {
                Output.greenBoldUnderline("Auto-commit will remain disabled.");
            }
            rl.close();
        }
    );
}

function selectItems(prompt: string, items: string[], callback: (selectedItems: string[]) => void) {
    const selectedItems = new Set<string>();
    let currentIndex = 0;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function displayItems() {
        console.clear();
        console.log(prompt);
        items.forEach((item, index) => {
            const prefix = selectedItems.has(item) ? "[x]" : "[ ]";
            console.log(`${prefix} ${item}`);
        });
    }

    function handleKeyPress(key: any) {
        if (key.name === "space") {
            const currentItem = items[currentIndex];
            if (selectedItems.has(currentItem)) {
                selectedItems.delete(currentItem);
            } else {
                selectedItems.add(currentItem);
            }
            displayItems();
        } else if (key.name === "return") {
            rl.close();
            callback(Array.from(selectedItems));
        } else if (key.name === "up") {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            displayItems();
        } else if (key.name === "down") {
            currentIndex = (currentIndex + 1) % items.length;
            displayItems();
        }
    }

    process.stdin.on("keypress", handleKeyPress);
    displayItems();
}
