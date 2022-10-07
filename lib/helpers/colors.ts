interface String {
  black(): string;
  red(): string;
  green(): string;
  yellow(): string;
  blue(): string;
  magenta(): string;
  cyan(): string;
  white(): string;
}

// @ts-ignore
const Reset = '\u001b[0m';
// @ts-ignore
const colorWithReset = (color: string, str: string) => color + str + Reset;

String.prototype.black = function (this: string) {
  return colorWithReset('\u001b[30m', this);
};
String.prototype.red = function (this: string) {
  return colorWithReset('\u001b[31m', this);
};

String.prototype.yellow = function (this: string) {
  return colorWithReset('\u001b[33m', this);
};

String.prototype.green = function (this: string) {
  return colorWithReset('\u001b[32m', this);
};
String.prototype.blue = function (this: string) {
  return colorWithReset('\u001b[34m', this);
};
String.prototype.magenta = function (this: string) {
  return colorWithReset('\u001b[35m', this);
};
String.prototype.cyan = function (this: string) {
  return colorWithReset('\u001b[36m', this);
};
String.prototype.white = function (this: string) {
  return colorWithReset('\u001b[37m', this);
};
