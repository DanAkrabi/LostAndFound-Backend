"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedVar = void 0;
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const posts_model_1 = __importDefault(require("../models/posts_model"));
const users_model_1 = __importDefault(require("../models/users_model"));
const server_1 = __importDefault(require("../server"));
let app;
beforeAll(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield posts_model_1.default.deleteMany();
    yield users_model_1.default.deleteMany();
    yield (0, supertest_1.default)(app).post("/auth/register").send(userInfo);
    const response = yield (0, supertest_1.default)(app)
      .post("/auth/login")
      .send(userLogin);
    userInfo._id = response.body._id;
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshToken = response.body.refreshToken;
    userInfo.username = response.body.username;
  })
);
afterAll(() => {
  mongoose_1.default.connection.close();
});
const userLogin = {
  emailOrUsername: "DanAkrabi",
  password: "123456",
};
const userInfo = {
  email: "DanAkrabi@gmail.com",
  password: "123456",
  username: "DanAkrabi",
};
const post = {
  title: "Test Post",
  content: "Test Content",
  owner: userInfo.username,
  location: "Tell Aviv",
  imgUrl: "PostImgUrl",
};
const post2 = {
  title: "Tarzan",
  content: "dvdvdav",
  owner: userInfo.username,
  location: "Tell Aviv",
  imgUrl: "Need to put make it empty to make url",
};
let postID = "";
exports.sharedVar = postID;
describe("posts tests", () => {
  test("Test 1 - GET ALL POSTS-EMPTY", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app).get("/posts/");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    }));
  test("Test 2 - CREATE A POST", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      jest.setTimeout(30000);
      console.log("**********Test2*********");
      const response = yield (0, supertest_1.default)(app)
        .post("/posts/")
        .set({ Authorization: "jwt " + userInfo.accessToken })
        .send(Object.assign(Object.assign({}, post), { sender: userInfo._id }));
      console.log("Response Body:", response.body);
      console.log(userInfo.username);
      console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Test Post");
      expect(response.body.content).toBe("Test Content");
      expect(response.body.sender).toBe(userInfo.username);
      postID = response.body._id;
      const response2 = yield (0, supertest_1.default)(app)
        .post(`/posts/create/${userInfo._id}`) // ✅ אותו דבר כאן
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        })
        .send(post2);
      expect(response2.status).toBe(201);
      console.log("Response2 Body:", response2.body);
      expect(response2.body.title).toBe(post2.title);
      expect(response2.body.content).toBe(post2.content);
      expect(response2.body.sender).toBe(userInfo.username);
    }));
  test("Test 3- GET ALL POSTS-FULL", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app).get("/posts");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    }));
  test("Test 4 - GET A POST BY ID", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app).get(
        "/posts/" + postID
      );
      expect(response.status).toBe(200);
    }));
  test("Test 5 - GET A POST BY POST OWNER", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app).get(
        "/posts/?owner=" + userInfo.username
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    }));
  test("Test 6 - CHANGE A POST", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .put("/posts/" + postID)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        })
        .send({ content: "New Content" });
      expect(response.status).toBe(200);
      expect(response.body.content).toBe("New Content");
    }));
  test("Test 7 -  FAILURE CREATE A POST", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .post("/posts")
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        })
        .send({ title: "Test Post" });
      console.log(response.body);
      expect(response.status).toBe(400);
      expect(response.text).toContain("Missing required fields");
    }));
  test("Test 8 - FAILURE TO GET A POST BY ID", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app).get("/posts/123");
      expect(response.status).toBe(400);
    }));
  test("Test 10 - FAILURE TO GET A POST BY POST owner", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const owner = "NonExistingOwner";
      const response = yield (0, supertest_1.default)(app).get(
        `/posts/?author=${owner}`
      );
      expect(response.status).toBe(200);
    }));
  test("Test 11 - FAIULRE TO UPDATE A POST - RECIEVE ERROR", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const mockerror = jest
        .spyOn(posts_model_1.default, "findByIdAndUpdate")
        .mockRejectedValue(new Error("Database connection error"));
      const response = yield (0, supertest_1.default)(app)
        .put("/posts/" + postID)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        })
        .send({ content: "New Content" });
      expect(response.status).toBe(400);
    }));
  test("Test 12 - addLike to post ", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .put(`/posts/like/67daebdea238c923e6ab5d3b`) //used id
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      console.log("test 12\n" + response.text);
      expect(response.status).toBe(404);
      expect(response.text).toBe("Couldn't find post");
      console.log("before add like postID: " + postID);
      const response2 = yield (0, supertest_1.default)(app)
        .put(`/posts/like/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response2.status).toBe(200);
      expect(response2.body.likes).toBe(1);
      const response3 = yield (0, supertest_1.default)(app)
        .put(`/posts/like/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response3.text).toBe("User already liked this post");
      expect(response3.status).toBe(400);
    }));
  test("Test 13 - Dislike to post ", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .put(`/posts/unlike/67daebdea238c923e6ab5d3b`) //used id
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      console.log("test 13\n" + response.text);
      expect(response.status).toBe(404);
      expect(response.text).toBe("Couldn't find post");
      const response2 = yield (0, supertest_1.default)(app)
        .put(`/posts/unlike/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response2.status).toBe(200);
      expect(response2.body.likes).toBe(0);
      const response3 = yield (0, supertest_1.default)(app)
        .put(`/posts/unlike/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response3.text).toBe("User has not liked this post");
      expect(response3.status).toBe(400);
    }));
  test("Test 14 - isLiked ", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .get(`/posts/isLiked/67daebdea238c923e6ab5d3b`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      console.log("test 14\n" + response.text);
      expect(response.status).toBe(200);
      expect(response.body).toBe(false);
      const response2 = yield (0, supertest_1.default)(app)
        .put(`/posts/like/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response2.status).toBe(200);
      expect(response2.body.likes).toBe(1);
      const response3 = yield (0, supertest_1.default)(app)
        .get(`/posts/isLiked/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response3.status).toBe(200);
      expect(response3.body).toBe(true);
    }));
  test("Test 14 - Delete Post", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .delete(`/posts/delete/67daebdea238c923e6ab5d3b`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      console.log(response.body);
      expect(response.status).toBe(404);
      expect(response.text).toBe("Couldnt find post");
      const response2 = yield (0, supertest_1.default)(app)
        .delete(`/posts/delete/${postID}`)
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        });
      expect(response2.status).toBe(200);
      console.log(response2.body);
      expect(response2.body._id).toBe(postID);
    }));
  test("Test 15 - CREATE POST FAILURE - MISSING FIELDS", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const response = yield (0, supertest_1.default)(app)
        .post("/posts/create")
        .set({
          Authorization: "jwt " + userInfo.accessToken,
        })
        .send({ title: "Incomplete Post" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Missing required fields");
    }));
});
//# sourceMappingURL=posts.test.js.map
