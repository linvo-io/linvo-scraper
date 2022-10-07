"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeid = void 0;
function makeid(size = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
exports.makeid = makeid;
//# sourceMappingURL=make.id.js.map