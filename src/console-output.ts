import { bold, green, red, yellow } from "kleur"
import { AngularUpdateConfig } from "./config/update-config"
import { TextEn } from "./model/text-en"

export abstract class Output {
    static simple(text: string) {
        console.log(text)
    }

    static greenBoldUnderline(text: string) {
        console.log(green().bold().underline(text))
    }

    static yellow(text: string) {
        console.log(yellow(text))
    }

    static error(text: string) {
        console.log(red(text))
    }

    static boldItalic(text: string) {
        console.log(bold().italic(text))
    }

    static bold(text: string) {
        console.log(bold(text))
    }
}

export abstract class OutputCustom {
    static gitAdd(packageName: string) {
        Output.boldItalic(TextEn.UP_GIT_ADD.replace("${packageName}", packageName));
    }

    static updatingNext(type: string) {
        Output.bold(TextEn.UP_UPDATING_NEXT.replace("${type}", type));
    }

    static updatePackageError(packageName: string, error: Error) {
        Output.error(TextEn.UP_UPDATE_PACKAGE_ERROR.replace("${packageName}", packageName).replace("${error}", error.message));
    }

    static npmAuditError(error: Error) {
        Output.error(TextEn.UP_ERROR_NPM_AUDIT.replace("${error}", error.message));
    }

    static addConfig(config: AngularUpdateConfig){
        Output.greenBoldUnderline(TextEn.CLI_ADD_CONFIG.replace("${config}", JSON.stringify(config, null, 2)))
    }
}