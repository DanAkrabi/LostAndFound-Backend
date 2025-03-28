import expressModule, { Request, Response } from "express";
const routingEngine = expressModule.Router();
const fileUploader = require("multer");

const rootUrl = process.env.DOMAIN_BASE + "/";
interface FileObject {
  originalname: string;
}

interface DestinationCallback {
  (error: Error | null, destination: string): void;
}

interface FilenameCallback {
  (error: Error | null, filename: string): void;
}

const fileDestinationConfig = fileUploader.diskStorage({
  destination: (
    request: Express.Request,
    fileObject: FileObject,
    callback: DestinationCallback
  ) => {
    callback(null, "storage/");
  },
  filename: (
    request: Express.Request,
    fileObject: FileObject,
    callback: FilenameCallback
  ) => {
    const fileExtension = fileObject.originalname
      .split(".")
      .filter(Boolean)
      .slice(1)
      .join(".");
    callback(null, Date.now() + "." + fileExtension);
  },
});
const uploadHandler = fileUploader({ storage: fileDestinationConfig });

routingEngine.post(
  "/",
  uploadHandler.single("file"),
  (request: Request, response: Response) => {
    console.log("routingEngine.post(/file: " + rootUrl + request.file?.path);
    response.status(200).send({ url: rootUrl + request.file?.path });
  }
);
module.exports = routingEngine;
