import request from "supertest";
import initApp from "../server"; //importing the app so we can use it on our tests
import mongoose from "mongoose";
import commentsModel from "../models/comments_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";
import postModel from "../models/posts_model";

let app: Express;
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await postModel.deleteMany();
  await userModel.deleteMany();
  await commentsModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.token; //we want to to get the token so we could use it for tests
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();
  const res2 = await request(app)
    .post("/posts")
    .set({ authorization: "JWT " + testUser.token })
    .send(testPost);
  // postId = res2.body._id;
  testComment.postId = res2.body._id;
}, 100000); //jest is looking and running this function at first, inside this function we will implement the logic to setup the test environment,
//because node is async we need a callback function to tell jest that we are done with the setup work
const testPost = {
  title: "Test title posts in comments",
  content: "Test content posts in comments",
  sender: "Michael",
};
afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});
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

type User = IUser & { token?: string };

const testUser: User = new userModel({
  email: "test@user.com",
  password: "testPassword",
  refreshTokens: [],
});

describe("Comments test suite", () => {
  //because jest is async and were getting a promise from request(app).get("/posts").expect(200); we need to use async/await
  test("Test Adding new comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send(testComment);
    // console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(testComment.content);
    expect(response.body.postId).toBe(testComment.postId);
    // expect(response.body.sender).toBe(testComment.sender);
    commentId = response.body._id;
  });
  test("Comment test get all comments", async () => {
    const response = await request(app).get("/comments").expect(200);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  }); //this is the test case, inside this we will write our test logic

  test("Test get all comments after adding", async () => {
    const response = await request(app).get("/comments").expect(200);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Test Adding new invalid comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send(invalidComment);
    expect(response.statusCode).not.toBe(201);
  });

  test("Test get comment by sender", async () => {
    const response = await request(app).get(
      "/comments?sender=" + testComment.sender
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].sender).toBe(testComment.sender);
  });

  test("Test get comment by id", async () => {
    const response = await request(app).get("/comments/" + commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
  });

  test("Test get comment by id fail", async () => {
    const response = await request(app).get(
      "/comments/67447b032ce3164be7c4412d"
    );
    expect(response.statusCode).toBe(404);
  });

  test("Test update comment", async () => {
    const updatedComment = { content: "Updated comment content" };
    const response = await request(app)
      .put("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token })
      .send(updatedComment);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(updatedComment.content);
  });

  test("Test update comment with invalid data", async () => {
    const invalidUpdate = { content: 10 };
    const response = await request(app)
      .put("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token })
      .send(invalidUpdate);
    expect(response.statusCode).toBe(400);
  });

  test("Test delete comment", async () => {
    const response = await request(app)
      .delete("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token });
    expect(response.statusCode).toBe(200);
  });

  test("Test delete comment with invalid id", async () => {
    const response = await request(app)
      .delete("/comments/invalidId")
      .set({ authorization: "JWT " + testUser.token });
    expect(response.statusCode).toBe(400);
  });

  test("Test get all comments after deletion", async () => {
    const response = await request(app).get("/comments").expect(200);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
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
