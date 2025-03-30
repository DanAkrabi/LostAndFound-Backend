"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const PORT = process.env.PORT;
(0, server_1.default)().then((app) => {
    if (process.env.NODE_ENV != 'production') {
        console.log('server in dev-mode');
        http_1.default.createServer(app).listen(PORT);
    }
    else {
        const option = {
            key: fs_1.default.readFileSync('./client-key.pem'),
            cert: fs_1.default.readFileSync('./client-cert.pem'),
        };
        console.log('server in prod-mode');
        https_1.default.createServer(option, app).listen(PORT);
    }
})
    .catch((err) => {
    console.log("Error initializing app", err);
});
//# sourceMappingURL=app.js.map