import { util } from "./util";

declare global {
    interface String {
        equalCaseIgnored(compareVal: string): boolean;
        toNullString(): string;
    }
}

String.prototype.equalCaseIgnored = function (compareVal: string): boolean {
    if (this && !compareVal) return false;
    if (!this && compareVal) return false;

    return this.toUpperCase() === compareVal.toUpperCase();
}

String.prototype.toNullString = function (): string {
    return util.toNullStr(this as string);
}