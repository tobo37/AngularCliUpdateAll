export type AngularUpdateConfig = {
    migrateAngularVersion: boolean,
    ignoreDependencies: string[],
    ignoreDevDependencies: string[],
    removeVersioningSymbols: boolean,
    autoCommitDuringUpdate: boolean,
    runtime: RuntimeConfig
}

export type RuntimeConfig = {
    angularCurrentVersion: string
    angularTargetVersion: string
}

export const DefaultConfig: AngularUpdateConfig = {
    migrateAngularVersion: false,
    removeVersioningSymbols: false,
    ignoreDependencies: [],
    ignoreDevDependencies: [],
    autoCommitDuringUpdate: false,
    runtime: {
        angularCurrentVersion: '',
        angularTargetVersion: ''
    }
};