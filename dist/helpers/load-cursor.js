"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const show_mouse_1 = require("./show.mouse");
const ghost_cursor_1 = require("ghost-cursor");
const loadCursor = async (page, headless) => {
    if (!headless) {
        await (0, show_mouse_1.installMouseHelper)(page);
    }
    page.cursor = await (0, ghost_cursor_1.createCursor)(page);
};
exports.default = loadCursor;
//# sourceMappingURL=load-cursor.js.map