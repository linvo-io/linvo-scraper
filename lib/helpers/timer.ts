export function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const timer = (num: number) => {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, num + randomIntFromInterval(-1000, 1000));
  });
};
