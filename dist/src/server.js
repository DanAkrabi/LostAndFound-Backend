"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const posts_routes_1 = __importDefault(require("./routes/posts_routes"));
const comments_routes_1 = __importDefault(require("./routes/comments_routes"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const swaggerConfig_1 = require("../swaggerConfig");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const db = mongoose_1.default.connection;
db.on("error", (err) => {
    console.error(err);
});
db.once("open", () => {
    console.log("Connected to MongoDB");
});
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use("/comments", comments_routes_1.default);
app.use("/posts", posts_routes_1.default); //brings all the routes we declared on ./routes/post_routes, and connects it to our app (makes it work like we wrote it on app.js).
app.use("/auth", auth_routes_1.default);
``;
app.get("/about", (req, res) => {
    res.send("about response");
});
const frontPath = path_1.default.join(__dirname, "../front"); // מתאים למבנה שלך
app.use(express_1.default.static(frontPath));
// כל בקשה שלא תואמת ל-API תחזיר את ה-React index.html
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(frontPath, "index.html"));
});
console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);
(0, swaggerConfig_1.setupSwagger)(app);
const initApp = () => {
    return new Promise((resolve, reject) => {
        //if the promise succeed, it will the app param to app.ts which is an <Express> type that we destructured from express
        //the purpose of this function is to  activate the db server befor the app server
        if (process.env.MONGO_URI === undefined) {
            console.error("MONGO_URI is not set");
            reject();
        }
        else {
            mongoose_1.default.connect(process.env.MONGO_URI).then(() => {
                //only after the db is up, we will start the app server with the when the 'Promise' will be sent to the app.js
                console.log("initApp finished inside server.js");
                resolve(app);
            });
        }
    });
};
// Start server
exports.default = initApp; //exporting the app so we can use it on our tests
//# sourceMappingURL=server.js.map