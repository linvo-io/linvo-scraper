"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linkedin_email_service_1 = require("./linkedin/linkedin.email.service");
const linkedin_connect_service_1 = require("./linkedin/linkedin.connect.service");
const linkedin_message_service_1 = require("./linkedin/linkedin.message.service");
const linkedin_message_with_view_1 = require("./linkedin/linkedin.message.with.view");
const linkedin_global_page_service_1 = require("./linkedin/linkedin.global.page.service");
const linkedin_accepted_connection_request_service_1 = require("./linkedin/linkedin.accepted.connection.request.service");
const linkedin_messages_from_chat_1 = require("./linkedin/linkedin.messages.from.chat");
const linkedin_login_service_1 = require("./linkedin/linkedin.login.service");
const linkedin_messages_service_1 = require("./linkedin/linkedin.messages.service");
const linkedin_endorse_service_1 = require("./linkedin/linkedin.endorse.service");
const linkedin_like_service_1 = require("./linkedin/linkedin.like.service");
const linkedin_visit_service_1 = require("./linkedin/linkedin.visit.service");
const linkedin_engagement_service_1 = require("./linkedin/linkedin.engagement.service");
const LinkedinService = {
    extract_information: new linkedin_email_service_1.LinkedinEmailService(),
    connect: new linkedin_connect_service_1.LinkedinConnectService(),
    message: new linkedin_message_service_1.LinkedinMessageService(),
    message_with_view: new linkedin_message_with_view_1.LinkedinMessageWithView(),
    scraper: new linkedin_global_page_service_1.LinkedinGlobalPageService(),
    accepted_connection_request: new linkedin_accepted_connection_request_service_1.LinkedinAcceptedConnectionsService(),
    chat: new linkedin_messages_from_chat_1.LinkedinMessagesFromChat(),
    login: new linkedin_login_service_1.LinkedinLoginService(),
    messages: new linkedin_messages_service_1.LinkedinMessagesService(),
    endorse: new linkedin_endorse_service_1.LinkedinEndorseService(),
    like: new linkedin_like_service_1.LinkedinLikeService(),
    visit: new linkedin_visit_service_1.LinkedinVisitService(),
    engagement: new linkedin_engagement_service_1.LinkedinEngagementService(),
};
exports.default = LinkedinService;
//# sourceMappingURL=linkedin.service.js.map