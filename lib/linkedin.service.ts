import {LinkedinEmailService} from "./linkedin/linkedin.email.service";
import {LinkedinConnectService} from "./linkedin/linkedin.connect.service";
import {LinkedinMessageService} from "./linkedin/linkedin.message.service";
import {LinkedinMessageWithView} from "./linkedin/linkedin.message.with.view";
import {LinkedinGlobalPageService} from "./linkedin/linkedin.global.page.service";
import {LinkedinAcceptedConnectionsService} from "./linkedin/linkedin.accepted.connection.request.service";
import {LinkedinMessagesFromChat} from "./linkedin/linkedin.messages.from.chat";
import {LinkedinLoginService} from "./linkedin/linkedin.login.service";
import {LinkedinMessagesService} from "./linkedin/linkedin.messages.service";
import {LinkedinEndorseService} from "./linkedin/linkedin.endorse.service";
import {LinkedinLikeService} from "./linkedin/linkedin.like.service";
import {LinkedinVisitService} from "./linkedin/linkedin.visit.service";
import {LinkedinEngagementService} from "./linkedin/linkedin.engagement.service";
import loadCursor from "./helpers/load-cursor";

export const services = {
    extract_information: new LinkedinEmailService(),
    connect: new LinkedinConnectService(),
    message: new LinkedinMessageService(),
    message_with_view: new LinkedinMessageWithView(),
    scraper: new LinkedinGlobalPageService(),
    accepted_connection_request: new LinkedinAcceptedConnectionsService(),
    chat: new LinkedinMessagesFromChat(),
    login: new LinkedinLoginService(),
    messages: new LinkedinMessagesService(),
    endorse: new LinkedinEndorseService(),
    like: new LinkedinLikeService(),
    visit: new LinkedinVisitService(),
    engagement: new LinkedinEngagementService(),
}

export const tools = {
    loadCursor
}
