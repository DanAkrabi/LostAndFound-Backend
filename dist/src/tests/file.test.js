"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server")); //importing the app so we can use it on our tests
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    console.log("beforeAll");
}));
afterAll(() => {
    mongoose_1.default.connection.close();
});
describe("File Tests", () => {
    test("upload file", () => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = `${__dirname}/textFile.txt`;
        try {
            const response = yield (0, supertest_1.default)(app)
                .post("/file?file=textFile.txt")
                .attach("file", filePath);
            expect(response.statusCode).toEqual(200);
            let url = response.body.url;
            console.log(url);
            url = url.replace(/^.*\/\/[^/]+/, "");
            const res = yield (0, supertest_1.default)(app).get(url);
            console.log(url);
            expect(res.statusCode).toEqual(200);
        }
        catch (err) {
            console.log(err);
            expect(1).toEqual(2);
        }
    }));
});
//# sourceMappingURL=file.test.js.map