/* eslint-disable @typescript-eslint/require-await */
import errorHandler from "errorhandler";
import express from "express";
import http from "http";
import config from "./config";
import { startGraphQLServer } from "./app/graphql/server";
import { upload } from "./multer-config";
import cors from "cors";
import axios from "axios";
import path from "path";

async function main(): Promise<void> {
  // Create Express server
  const app: express.Application = express();
  const httpServer = http.createServer(app);
  const allowedOrigins = ["http://localhost:3000", "http://localhost:8000"];
  const corsOptions = {
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        // Allow requests from the specified origins
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };

  app.use(cors(corsOptions));

  //Error Handler. Provides full stack trace.
  if (config.debug) {
    app.use(errorHandler());
  }

  await startGraphQLServer(app, httpServer);

  app.get("/images/:filename", (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(process.cwd(), "uploads", filename);
    res.sendFile(imagePath);
  });
  // Handle file upload
  app.post("/upload-profile-picture", upload.single("image"), async (req, res, next) => {
    const file = req.file;
    const userId = req.body.userId;
    if (!file) {
      const error = new Error("Please upload a file");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).status = 400;
      return next(error);
    }
    try {
      process.env.DEBUG = "axios";
      const response = await axios.post(`http://${config.http.host}:${config.http.port}/graphql`, {
        query: `
        mutation updateProfilePicture($profilePicture: String!, $id: Int!) {
          updateProfilePicture (
            profilePicture: $profilePicture,
            id: $id,
          ) {
            id
            name
            profilePicture
          }
        }
      `,
        variables: {
          profilePicture: `http://${config.http.host}:${config.http.port}/${file.path}`,
          id: parseInt(userId),
        },
      });

      const { updateProfilePicture } = response.data.data;
      console.log(updateProfilePicture, "success upload");
      res.status(200).json({
        message: "File uploaded successfully",
        data: {
          filename: file.filename,
          url: `http://${config.http.host}:${config.http.port}/${file.path}`,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/upload-company-logo", upload.single("image"), async (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).status = 400;
      return next(error);
    }
    try {
      process.env.DEBUG = "axios";
      res.status(200).json({
        message: "File uploaded successfully",
        data: {
          filename: file.filename,
          url: `http://${config.http.host}:${config.http.port}/${file.path}`,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Start Express server.
  await new Promise<void>((resolve) => httpServer.listen(config.http.port, resolve));
  console.log(
    "[Server] Server is running on " +
      `http://${config.http.host}:${config.http.port} in ${app.get("env") as string} mode.`
  );
  console.log("[Server] Press CTRL-C to stop.\n");
}

void main();
