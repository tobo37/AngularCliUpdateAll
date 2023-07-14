import { bold, green, yellow } from "kleur";
import { Output, OutputCustom } from "../src/console-output";
import { TextEn } from "../src/model/text-en";

describe("Output", () => {
    it("should log a simple text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        Output.simple("This is a simple text");
        expect(consoleSpy).toHaveBeenCalledWith("This is a simple text");
    });

    it("should log a green bold underlined text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        Output.greenBoldUnderline("This is a green bold underlined text");
        expect(consoleSpy).toHaveBeenCalledWith(green().bold().underline("This is a green bold underlined text"));
    });

    it("should log a yellow text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        Output.yellow("This is a yellow text");
        expect(consoleSpy).toHaveBeenCalledWith(yellow("This is a yellow text"));
    });

    it("should log an error text", () => {
        const consoleSpy = jest.spyOn(console, "error");
        Output.error("This is an error text");
        expect(consoleSpy).toHaveBeenCalledWith("This is an error text");
    });

    it("should log a bold italic text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        Output.boldItalic("This is a bold italic text");
        expect(consoleSpy).toHaveBeenCalledWith(bold().italic("This is a bold italic text"));
    });

    it("should log a bold text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        Output.bold("This is a bold text");
        expect(consoleSpy).toHaveBeenCalledWith(bold("This is a bold text"));
    });
});

describe("OutputCustom", () => {
    it("should log a git add text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        OutputCustom.gitAdd("next");
        expect(consoleSpy).toHaveBeenCalledWith(bold().italic(TextEn.UP_GIT_ADD.replace("${packageName}", "next")));
    });

    it("should log an updating next text", () => {
        const consoleSpy = jest.spyOn(console, "log");
        OutputCustom.updatingNext("major");
        expect(consoleSpy).toHaveBeenCalledWith(bold(TextEn.UP_UPDATING_NEXT.replace("${type}", "major")));
    });

    it("should log an update package error text", () => {
        const consoleSpy = jest.spyOn(console, "error");
        const error = new Error("Something went wrong");
        OutputCustom.updatePackageError("next", error);
        expect(consoleSpy).toHaveBeenCalledWith(
            TextEn.UP_UPDATE_PACKAGE_ERROR.replace("${packageName}", "next").replace("${error}", error.message)
        );
    });

    it("should log an npm audit error text", () => {
        const consoleSpy = jest.spyOn(console, "error");
        const error = new Error("Something went wrong");
        OutputCustom.npmAuditError(error);
        expect(consoleSpy).toHaveBeenCalledWith(TextEn.UP_ERROR_NPM_AUDIT.replace("${error}", error.message));
    });
});
