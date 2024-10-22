export interface AngularUpdateConfig {
    migrateAngularVersion: boolean;
    ignoreDependencies: string[];
    ignoreDevDependencies: string[];
    removeVersioningSymbols: boolean;
    autoCommitDuringUpdate: boolean;
}

export const DefaultConfig = {
    migrateAngularVersion: false,
    removeVersioningSymbols: false,
    ignoreDependencies: [],
    ignoreDevDependencies: [],
    autoCommitDuringUpdate: false
};