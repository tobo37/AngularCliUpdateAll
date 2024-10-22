export interface AngularUpdateConfig {
    migrateAngularVersion: boolean;
    ignoreDependencies: string[];
    ignoreDevDependencies: string[];
    removeVersioningSymbols: boolean;
    autoCommitDuringUpdate: boolean;
}