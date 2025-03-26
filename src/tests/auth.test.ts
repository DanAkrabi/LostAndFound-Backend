import request from "supertest";
import initApp from "../server"; //importing the app so we can use it on our tests
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";
import { title } from "process";
// import { UserInfo } from "os";
let app: Express;
beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
}); //jest is looking and running this function at first, inside this function we will implement the logic to setup the test environment,
//because node is async we need a callback function to tell jest that we are done with the setup work

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});

type UserInfo = {
  email: string;
  password: string;
  accessToken?: string;
  refreshTokens?: string;
  _id?: string;
};

const userInfo: UserInfo = {
  email: "eliav@gmail.com",
  password: "123456",
};

type User = IUser & { token?: string };

// const testUser: User = {
//   email: "test@user.com",
//   password: "testPassword",
// };
const baseUrl = "/auth";
describe("Auth test suite", () => {
  //because jest is async and were getting a promise from request(app).get("/posts").expect(200); we need to use async/await

  test("Auth test register", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(userInfo);
    expect(response.statusCode).toBe(200);
  });

  test("Auth test register fail1", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(userInfo);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail2", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "fasfasf",
      });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app)
      .post(baseUrl + "/register")
      .send({
        email: "",
        password: "fasfasf",
      });
  });

  test("Auth test login", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(userInfo);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshTokens;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshTokens = response.body.refreshTokens;
    userInfo._id = response.body._id;
  });

  test("Make sure two access tokwns are different", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(userInfo);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).not.toBe(userInfo.accessToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({ email: userInfo.email, password: "wrongPassword" });
    expect(response.body.accessToken).not.toEqual(userInfo.accessToken);
  });

  test("Auth test me", async () => {
    // Assuming this request does not require authorization
    const response = await request(app).post("/posts").send({
      title: "Test post",
      content: "Test post content",
      sender: "safas",
    });

    // Check if this first request actually fails as expected
    expect(response.statusCode).not.toBe(201);

    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + userInfo.accessToken })
      .send({
        title: "Test post",
        content: "Test post content@@@@@@@@",
        sender: "safas",
      });

    expect(response2.statusCode).toBe(201);
  });
  // test("Auth test me", async () => {
  //   const response = await request(app).post("/posts").send({
  //     title: "Test post",
  //     content: "Test post content",
  //     sender: "safas",
  //   });
  //   expect(response.statusCode).not.toBe(201);

  //   const response2 = await request(app)
  //     .post("/posts")
  //     .set({ authorization: "JWT" + userInfo.token }) //passing the token to the header
  //     .send({
  //       title: "Test post",
  //       content: "Test post content",
  //       sender: "safas",
  //     });

  //   expect(response2.statusCode).toBe(201);
  // });

  test("Get protected API", async () => {
    const response = await request(app).post("/posts").send({
      sender: "invalid sender",
      title: "my first post",
      content: "this is my first post",
    });
    // console.log(response.body);
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app)
      .post("/posts")
      .set({
        authorization: "JWT " + userInfo.accessToken,
      })
      .send({
        sender: "invalid sender",
        title: "my first post",
        content: "this is my first post",
      });
    console.log("user access token: ", userInfo.accessToken);

    console.log(response2.body);
    expect(response2.statusCode).toBe(201);
  });

  test("Get protected API invalid token", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + userInfo.accessToken + "1" })
      .send({
        sender: userInfo._id,
        title: "my first post",
        content: "this is my first post",
      });

    expect(response.statusCode).not.toBe(201);
  });

  test("Refresh Token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshTokens).toBeDefined();
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshTokens = response.body.refreshTokens;
  });

  test("Refresh Token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshTokens).toBeDefined();
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshTokens = response.body.refreshTokens;
  });

  test("Logout - invalidate refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({ refreshTokens: userInfo.refreshTokens }); //sending the refresh token on logout so we can delete it from the db
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Refresh token multiple usage", async () => {
    console.log(userInfo.refreshTokens);

    console.log(userInfo.accessToken);
    //login - get a new refresh token
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({ email: userInfo.email, password: userInfo.password });

    expect(response.statusCode).toBe(200);
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshTokens = response.body.refreshTokens;
    //first time use the refresh token and get a new one
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });
    expect(response2.statusCode).toBe(200);
    const newRefreshTokens = response2.body.refreshTokens;
    //second time use the old refresh token and expect it to fail

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });
    expect(response3.statusCode).not.toBe(200);
    //try to uise the new refresh token and expect it to fail
    const response4 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: newRefreshTokens });
    expect(response4.statusCode).not.toBe(200);
  });

  jest.setTimeout(10 * 1000);
  test("timeout on refresh access token", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: userInfo.email,
        password: userInfo.password,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshTokens).toBeDefined();
    userInfo.accessToken = response.body.accessToken;
    userInfo.refreshTokens = response.body.refreshTokens;

    //wait 6seconds
    await new Promise((resolve) => setTimeout(resolve, 6 * 1000));

    //try to access with expired token
    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + userInfo.accessToken })
      .send({
        title: "my first post",
        content: "Test post content",
        sender: "invalid sender",
      });
    expect(response2.statusCode).not.toBe(201);
    //next step - create a new token with the refresh token and than try again
    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshTokens: userInfo.refreshTokens });

    expect(response3.statusCode).toBe(200);
    userInfo.accessToken = response3.body.accessToken;
    userInfo.refreshTokens = response3.body.refreshTokens;

    const response4 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + userInfo.accessToken })
      .send({
        title: "my first post",
        content: "Test post content",
        sender: "invalid sender",
      });
    expect(response4.statusCode).toBe(201);
  });
});
