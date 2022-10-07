const Reset = '\u001b[0m';
const colorWithReset = (color, str) => color + str + Reset;
String.prototype.black = function () {
    return colorWithReset('\u001b[30m', this);
};
String.prototype.red = function () {
    return colorWithReset('\u001b[31m', this);
};
String.prototype.yellow = function () {
    return colorWithReset('\u001b[33m', this);
};
String.prototype.green = function () {
    return colorWithReset('\u001b[32m', this);
};
String.prototype.blue = function () {
    return colorWithReset('\u001b[34m', this);
};
String.prototype.magenta = function () {
    return colorWithReset('\u001b[35m', this);
};
String.prototype.cyan = function () {
    return colorWithReset('\u001b[36m', this);
};
String.prototype.white = function () {
    return colorWithReset('\u001b[37m', this);
};
//# sourceMappingURL=colors.js.map