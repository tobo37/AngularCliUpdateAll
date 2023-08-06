import { AngularUpdateConfig } from "../config/update-config";

export interface PackageJson {
    dependencies: { [key: string]: string };
    devDependencies: { [key: string]: string };
    updateThemAll?: AngularUpdateConfig;
}