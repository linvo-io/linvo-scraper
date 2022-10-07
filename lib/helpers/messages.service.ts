import emojiStrip from 'emoji-strip';
import { Page } from 'puppeteer-core';

interface MessageOptions {
  label: string;
  value: string;
}

export class MessagesService {
  static _replace(content: string, name: string, value: string) {
    if (content.indexOf('{{') === -1) {
      return content;
    }

    const reg = new RegExp(`\{\{${name}\}\}`, 'g');
    return content.replace(reg, value);
  }

  async messagesList(prospectName: string, page: Page) {
    await page.waitForSelector('.message-overlay__conversation article');
    return page.evaluate((fullName: any) => {
      return [
        ...Array.from(
          document.querySelectorAll('.message-overlay__conversation article'),
        ),
      ].map((current: any) => ({
        from:
          current
            .querySelector('address')
            ?.textContent?.trim()
            .indexOf(fullName) > -1
            ? 'Prospect'
            : 'Me',
        message: current.lastElementChild?.textContent?.trim(),
      }));
    }, prospectName);
  }

  async createMessage(
    message: string,
    params: MessageOptions[],
  ) {

    for (let param of params) {
      message = MessagesService._replace(
        message,
        param.label,
        emojiStrip(param.value || ''),
      );
    }

    return message.trim();
  }
}
