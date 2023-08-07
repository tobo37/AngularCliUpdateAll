export interface AngularUpdateConfig {
    keepAngularMajorVersion: boolean;
    ignoreDependencies: string[];
    ignoreDevDependencies: string[];
    removeVersioningSymbols: boolean;
    autoCommitDuringUpdate: boolean;
}