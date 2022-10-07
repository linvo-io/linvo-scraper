"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinErrors = exports.LINKEDIN_ERRORS = void 0;
var LINKEDIN_ERRORS;
(function (LINKEDIN_ERRORS) {
    LINKEDIN_ERRORS[LINKEDIN_ERRORS["DISCONNECTED"] = 0] = "DISCONNECTED";
    LINKEDIN_ERRORS[LINKEDIN_ERRORS["INVALID_CREDENTIALS"] = 1] = "INVALID_CREDENTIALS";
    LINKEDIN_ERRORS[LINKEDIN_ERRORS["DELAY"] = 2] = "DELAY";
})(LINKEDIN_ERRORS = exports.LINKEDIN_ERRORS || (exports.LINKEDIN_ERRORS = {}));
class LinkedinErrors {
    constructor(text, url, additional) {
        this.text = text;
        this.url = url;
        this.additional = additional;
    }
}
exports.LinkedinErrors = LinkedinErrors;
//# sourceMappingURL=linkedin.errors.js.map