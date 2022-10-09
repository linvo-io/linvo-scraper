import * as LinvoScraper from './linkedin.service';
import * as puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = (await browser.newPage());
    const cdp = await page.target().createCDPSession();

    // that's the res Linvo is working in production
    await page.setViewport({
        width: 1440,
        height: 900,
    });

    // add ghost-cursor for maximum safety
    await LinvoScraper.tools.loadCursor(page, true);

    // Login with Linkedin
    const {token} = await LinvoScraper.services.login.process(page, cdp, {
        user: 'bang@linvo.io',
        password: 'superStrongPass!!%'
    })

    // set cookies
    await page.setCookie({
        name: "li_at",
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "None",
        priority: "Medium",
        path: "/",
        domain: ".www.linkedin.com",
    });

    await LinvoScraper.services.connect.process(page, cdp, {
        message: 'Hi Nevo! Let\'s connect!',
        url: 'https://www.linkedin.com/in/nevo-david/'
    })
})();