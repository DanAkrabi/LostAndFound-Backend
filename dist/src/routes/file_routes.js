"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routingEngine = express_1.default.Router();
const fileUploader = require("multer");
const rootUrl = process.env.DOMAIN_BASE + "/";
const fileDestinationConfig = fileUploader.diskStorage({
    destination: (request, fileObject, callback) => {
        callback(null, "storage/");
    },
    filename: (request, fileObject, callback) => {
        const fileExtension = fileObject.originalname
            .split(".")
            .filter(Boolean)
            .slice(1)
            .join(".");
        callback(null, Date.now() + "." + fileExtension);
    },
});
const uploadHandler = fileUploader({ storage: fileDestinationConfig });
routingEngine.post("/", uploadHandler.single("file"), (request, response) => {
    var _a, _b;
    console.log("routingEngine.post(/file: " + rootUrl + ((_a = request.file) === null || _a === void 0 ? void 0 : _a.path));
    response.status(200).send({ url: rootUrl + ((_b = request.file) === null || _b === void 0 ? void 0 : _b.path) });
});
module.exports = routingEngine;
//# sourceMappingURL=file_routes.js.map