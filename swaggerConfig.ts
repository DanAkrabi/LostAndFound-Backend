import { Express } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

// const swaggerConfig = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Posts Server REST API",
//       version: "1.0.0",
//       description: "Posts REST server including authentication using JWT",
//     },
//     servers: [
//       {
//         url: "http://localhost:3000",
//       },
//       {
//         url: "https://node23.cs.colman.ac.il",
//       },
//     ],
//   },
//   apis: ["./src/routes/*.ts"],
// };
const swaggerConfig = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Posts Server REST API",
      version: "1.0.0",
      description: "Posts REST server including authentication using JWT",
    },
    servers: [
      { url: "http://localhost:3000" },
      { url: "https://node23.cs.colman.ac.il" },
    ],
    components: {
      securitySchemes: {
        jwtAuth: {
          type: "http",
          scheme: "jwt", // זה חשוב! תואם למה שאת באמת שולחת
        },
      },
    },
    security: [
      {
        jwtAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsDoc(swaggerConfig);

const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
};

export { setupSwagger };
