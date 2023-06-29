declare module "*.json" {
    const value: {
        keepAngularMayorVersion: boolean;
        removeVersioningSymbols: boolean;
        ignoreDependencies: string[];
        ignoreDevDependencies: string[];
    };
    export default value;
}