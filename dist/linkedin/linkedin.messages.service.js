"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinMessagesService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const linkedin_messages_from_chat_1 = require("./linkedin.messages.from.chat");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
const messagesFromChat = new linkedin_messages_from_chat_1.LinkedinMessagesFromChat();
class LinkedinMessagesService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        try {
            for (const messages of data.messages) {
                await page.goto('about:blank');
                (0, gotoUrl_1.gotoUrl)(page, messages.link);
                await this.waitForLoader(page);
                try {
                    for (const message of messages.messages) {
                        await (0, timer_1.timer)(5000);
                        await this.moveAndClick(page, '[contenteditable="true"]');
                        await page.keyboard.type(message, {
                            delay: 10,
                        });
                        await page.keyboard.press("Enter");
                        await (0, timer_1.timer)(1000);
                        await page.waitForFunction(() => {
                            return document.querySelector(".msg-form__send-button:not(:disabled), .msg-form__hint-text");
                        });
                        const totalBefore = await page.evaluate(() => {
                            return document.querySelectorAll(".msg-s-message-list__event")
                                .length;
                        });
                        await this.moveAndClick(page, ".msg-form__send-button:not(:disabled), .msg-form__hint-text");
                        await page.waitForFunction((before) => {
                            return (document.querySelectorAll(".msg-s-message-list__event")
                                .length !== before);
                        }, {}, totalBefore);
                    }
                }
                catch (err) {
                }
            }
        }
        catch (err) {
        }
        await page.goto('https://www.linkedin.com/messaging/');
        await (0, timer_1.timer)(4000);
        return messagesFromChat.continueGetAllMessagesFromChat(page);
    }
}
exports.LinkedinMessagesService = LinkedinMessagesService;
//# sourceMappingURL=linkedin.messages.service.js.map