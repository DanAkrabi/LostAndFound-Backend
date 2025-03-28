import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import initApp from "../server"; //importing the app so we can use it on our tests

import { Express } from "express";
let app: Express;

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
});

afterAll(() => {
  mongoose.connection.close();
});

describe("File Tests", () => {
  test("upload file", async () => {
    const filePath = `${__dirname}/textFile.txt`;

    try {
      const response = await request(app)
        .post("/file?file=textFile.txt")
        .attach("file", filePath);
      expect(response.statusCode).toEqual(200);
      let url = response.body.url;
      console.log(url);
      url = url.replace(/^.*\/\/[^/]+/, "");
      const res = await request(app).get(url);
      console.log(url);
      expect(res.statusCode).toEqual(200);
    } catch (err) {
      console.log(err);
      expect(1).toEqual(2);
    }
  });
});
