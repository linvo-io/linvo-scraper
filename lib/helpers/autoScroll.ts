// from https://stackoverflow.com/a/53527984/16780635
import { Page } from "puppeteer";

export async function autoScroll(page: Page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        var scrollTop = -1;
        const interval = setInterval(() => {
          window.scrollBy(0, 100);
          if (document.documentElement.scrollTop !== scrollTop) {
            scrollTop = document.documentElement.scrollTop;
            return false;
          }
          clearInterval(interval);
          resolve(void {});
        }, 150);
      })
  );
}
