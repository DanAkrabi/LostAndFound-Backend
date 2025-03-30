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
const server_1 = __importDefault(require("../server")); //importing the app so we can use it on our tests
const mongoose_1 = __importDefault(require("mongoose"));
const comments_model_1 = __importDefault(require("../models/comments_model"));
const users_model_1 = __importDefault(require("../models/users_model"));
const posts_model_1 = __importDefault(require("../models/posts_model"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    console.log("beforeAll");
    yield posts_model_1.default.deleteMany();
    yield users_model_1.default.deleteMany();
    yield comments_model_1.default.deleteMany();
    yield (0, supertest_1.default)(app).post("/auth/register").send(testUser);
    const res = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
    testUser.token = res.body.token; //we want to to get the token so we could use it for tests
    testUser._id = res.body._id;
    expect(testUser.token).toBeDefined();
    const res2 = yield (0, supertest_1.default)(app)
        .post("/posts")
        .set({ authorization: "JWT " + testUser.token })
        .send(testPost);
    // postId = res2.body._id;
    testComment.postId = res2.body._id;
}), 100000); //jest is looking and running this function at first, inside this function we will implement the logic to setup the test environment,
//because node is async we need a callback function to tell jest that we are done with the setup work
const testPost = {
    title: "Test title posts in comments",
    content: "Test content posts in comments",
    sender: "Michael",
};
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("afterAll");
    yield mongoose_1.default.connection.close();
}));
let commentId = "";
let postId = "";
const testComment = {
    content: "Test comment aaaaaaa",
    postId: postId, //507f1f77bcf86cd799439011
    sender: "Dan",
};
const invalidComment = {
    content: "Test invalid comment",
};
const testUser = new users_model_1.default({
    email: "test@user.com",
    password: "testPassword",
    refreshTokens: [],
});
describe("Comments test suite", () => {
    //because jest is async and were getting a promise from request(app).get("/posts").expect(200); we need to use async/await
    test("Test Adding new comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/comments")
            .set({ authorization: "JWT " + testUser.token })
            .send(testComment);
        // console.log(response);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(testComment.content);
        expect(response.body.postId).toBe(testComment.postId);
        // expect(response.body.sender).toBe(testComment.sender);
        commentId = response.body._id;
    }));
    test("Comment test get all comments", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments").expect(200);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    })); //this is the test case, inside this we will write our test logic
    test("Test get all comments after adding", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments").expect(200);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    }));
    test("Test Adding new invalid comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/comments")
            .set({ authorization: "JWT " + testUser.token })
            .send(invalidComment);
        expect(response.statusCode).not.toBe(201);
    }));
    test("Test get comment by sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments?sender=" + testComment.sender);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].sender).toBe(testComment.sender);
    }));
    test("Test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments/" + commentId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    }));
    test("Test get comment by id fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments/67447b032ce3164be7c4412d");
        expect(response.statusCode).toBe(404);
    }));
    test("Test update comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedComment = { content: "Updated comment content" };
        const response = yield (0, supertest_1.default)(app)
            .put("/comments/" + commentId)
            .set({ authorization: "JWT " + testUser.token })
            .send(updatedComment);
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(updatedComment.content);
    }));
    test("Test update comment with invalid data", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUpdate = { content: 10 };
        const response = yield (0, supertest_1.default)(app)
            .put("/comments/" + commentId)
            .set({ authorization: "JWT " + testUser.token })
            .send(invalidUpdate);
        expect(response.statusCode).toBe(400);
    }));
    test("Test delete comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/comments/" + commentId)
            .set({ authorization: "JWT " + testUser.token });
        expect(response.statusCode).toBe(200);
    }));
    test("Test delete comment with invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete("/comments/invalidId")
            .set({ authorization: "JWT " + testUser.token });
        expect(response.statusCode).toBe(400);
    }));
    test("Test get all comments after deletion", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments").expect(200);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
});
// test("Comments validation - missing content", async () => {
//   const response = await request(app)
//     .post("/comments")
//     .set({ authorization: "JWT " + testUser.token })
//     .send({ postId: testComment.postId });
//   expect(response.statusCode).toBe(400);
//   expect(response.body.message).toContain("Content is required");
// });
// test("Comments validation - invalid postId", async () => {
//   const response = await request(app)
//     .post("/comments")
//     .set({ authorization: "JWT " + testUser.token })
//     .send({ content: "Invalid PostId Test", postId: "invalid-post-id" });
//   expect(response.statusCode).toBe(400);
//   expect(response.body.message).toContain("Invalid postId");
// });
//# sourceMappingURL=comments.test.js.map