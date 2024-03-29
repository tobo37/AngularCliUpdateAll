export enum TextEn {
    CLI_INVALID_ARGS = "Invalid arguments",
    CLI_HELP = "Help: update-them-all [options]. Valid options are: -h, --help, --add-config",
    CLI_COMPLETE = "update complete",
    CLI_ADD_CONFIG = "add config: ${config}",
    UTIITY_CONFIG_NOT_FUND = `Configuration not found. We're using a default configuration instead. 
    If you want to create a configuration, create a file named "update-config.json" in the root directory of your project with the following content:
    
    {
      "keepAngularMajorVersion": true,
      "removeVersioningSymbols": false,
      "ignoreDependencies": [],
      "ignoreDevDependencies": []
    }
    `,
    UP_STARTING_UPDATING_FAST = "Try updating Packages fast...",
    UP_GIT_ADD = "git add / commit: ${packageName}",
    UP_GIT_SKIP = "Skipping git commit because autoCommitDuringUpdate is set to false",
    UP_UPDATING_NEXT = "Updating ${type}:",
    UP_UPDATE_PACKAGE_ERROR = "Error updating ${packageName}: ${error}",
    UP_STARTING_NPM_AUDIT = "Starting npm audit...",
    UP_ERROR_NPM_AUDIT = "Error running npm audit fix: ${error}",
    UP_ERROR_UPDATE_FAST = "All by Once fast Update is not possible. Run single updates instead."
}