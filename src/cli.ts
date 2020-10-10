import arg from 'arg';
import inquirer from 'inquirer';
import { AngularUdpater } from '.';

export interface updateOptions {
    dependencies: boolean;
    devDependencies: boolean;
    all: boolean;
    remaining: string;
    skipFix: boolean;
}



function parseArgumentsIntoOptions(rawArgs: string[]): updateOptions {
    const args = arg(
        {
            '--save': Boolean,
            '--save-dev': Boolean,
            '--all': Boolean,
            '--skip-fix': Boolean,
            '-dep': '--save',
            '-dev': '--save-dev',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        dependencies: args['--save'] || false,
        devDependencies: args['--save-dev'] || false,
        skipFix: args['--skip-fix'] || false,
        all: args['--all'] || false,
        remaining: args._[0]
    };
}

async function promptForMissingOptions(options: updateOptions) {
    if (options.all || options.dependencies || options.devDependencies) {
        return options;
    }

    const questions = [];
    questions.push({
        type: 'list',
        name: 'template',
        message: 'What you want to update?',
        choices: ['dependencies', 'devDependencies', 'all'],
        default: 'all',
    });

    const answers: 'dependencies' | 'devDependencies' | 'all'  = await inquirer.prompt(questions);
    options[answers] = true;
    return options;
}


export async function cli(args: any[]) {
    let options: updateOptions = {dependencies: false,
    devDependencies: false,
    skipFix: false,
    all: true,
    remaining: ''};
    // let options = parseArgumentsIntoOptions(args);
    // options = await promptForMissingOptions(options);
    const angularUpdater = new AngularUdpater(options);
    await angularUpdater.exec();

}