import request from "supertest";
import initApp from "../server"; //importing the app so we can use it on our tests
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";
let app: Express;
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await postModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.token; //we want to to get the token so we could use it for tests
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});

var postId = "";

const testPost = {
  title: "Test title",
  content: "Test content",
  sender: "Eliav",
};

const invalidPost = {
  title: "Test title",
  content: "Test content",
};

type User = IUser & { token?: string; refreshToken?: string };

const testUser: User = new userModel({
  email: "test@user.com",
  password: "testPassword",
  refreshTokens: [],
});
describe("Posts test suite", () => {
  test("Test Create Post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post",
        content: "Test Content",
        sender: "TestOwner",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    postId = response.body._id;
  });

  test("Test get post by sender", async () => {
    const response = await request(app).get("/posts?sender=" + testUser._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Test Post");
    expect(response.body[0].content).toBe("Test Content");
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
  });
  test("Test Create Post 2", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "Test Post 2",
        content: "Test Content 2",
        sender: "TestOwner2",
      });
    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const response = await request(app)
      .delete("/posts/" + postId)
      .set({ authorization: "JWT " + testUser.token });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get("/posts/" + postId);
    expect(response2.statusCode).toBe(404);
  });

  test("Test Create Post fail", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        content: "Test Content 2",
      });
    expect(response.statusCode).toBe(400);
  });
});
// test("Posts validation - missing title", async () => {
//   const response = await request(app)
//     .post("/posts")
//     .set({ authorization: "JWT " + testUser.token })
//     .send({ content: "Content without a title", sender: "TestUser" });
//   expect(response.statusCode).toBe(400);
//   expect(response.body.message).toContain("Title is required");
// });

// test("Posts validation - content length", async () => {
//   const longContent = "a".repeat(1001);
//   const response = await request(app)
//     .post("/posts")
//     .set({ authorization: "JWT " + testUser.token })
//     .send({ title: "Test Post", content: longContent, sender: "TestUser" });
//   expect(response.statusCode).toBe(400);
//   expect(response.body.message).toContain("Content exceeds the maximum length");
// });

// describe("Posts test suite", () => {
//   //because jest is async and were getting a promise from request(app).get("/posts").expect(200); we need to use async/await
//   test("Post test get all posts", async () => {
//     const response = await request(app).get("/posts").expect(200);
//     expect(response.statusCode).toBe(200);
//     expect(response.body.length).toBe(0);
//   }); //this is the test case, inside this we will write our test logic

//   test("Test Adding new post", async () => {
//     const response = await request(app)
//       .post("/posts")
//       .set({ authorization: "JWT" + testUser.token })
//       .send(testPost);
//     expect(response.statusCode).toBe(201);
//     expect(response.body.title).toBe(testPost.title);
//     expect(response.body.content).toBe(testPost.content);
//     expect(response.body.sender).toBe(testPost.sender);
//     postId = response.body._id;
//   });

//   test("Test Adding new invalid post", async () => {
//     const response = await request(app)
//       .post("/posts")
//       .set({ authorization: "JWT" + testUser.token })
//       .send(invalidPost);
//     expect(response.statusCode).not.toBe(201);
//   });

//   test("Test getting all posts after adding", async () => {
//     const response = await request(app).get("/posts").expect(200);
//     expect(response.statusCode).toBe(200);
//     expect(response.body.length).toBe(1);
//   });

//   test("Test get post by sender", async () => {
//     const response = await request(app).get("/posts?sender=" + testPost.sender);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toHaveLength(1);
//     expect(response.body[0].sender).toBe(testPost.sender);
//   });

//   test("Test get post by id", async () => {
//     const response = await request(app).get("/posts/" + postId);
//     expect(response.statusCode).toBe(200);
//     expect(response.body._id).toBe(postId);
//   });

//   test("Test get post by id fail", async () => {
//     const response = await request(app).get("/posts/67447b032ce3164be7c4412d");
//     expect(response.statusCode).toBe(404);
//   });

//   test("Test Delete Post", async () => {
//     const response = await request(app)
//       .delete("/posts/" + postId)
//       .set({ authorization: "JWT" + testUser.token });
//     expect(response.statusCode).toBe(200);

//     const response2 = await request(app)
//       .delete("/posts/" + postId)
//       .set({ authorization: "JWT" + testUser.token });

//     expect(response2.statusCode).toBe(404);
//   });
// });
