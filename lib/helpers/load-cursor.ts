import {Page} from "puppeteer-core";
import {installMouseHelper} from "./show.mouse";
import {createCursor} from 'ghost-cursor';

const loadCursor = async (page: Page, headless: boolean) => {
    if (!headless) {
        await installMouseHelper(page);
    }

    // @ts-ignore
    page.cursor = await createCursor(page);
}

export default loadCursor;