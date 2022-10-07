"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = exports.randomIntFromInterval = void 0;
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.randomIntFromInterval = randomIntFromInterval;
const timer = (num) => {
    return new Promise(res => {
        setTimeout(() => {
            res(true);
        }, num + randomIntFromInterval(-1000, 1000));
    });
};
exports.timer = timer;
//# sourceMappingURL=timer.js.map