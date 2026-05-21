import "dotenv/config";
import express from "express";
import cors from "cors";

import fs from "node:fs"
import path from "node:path";

import { clerkMiddleware } from "@clerk/express";
import { getEnv } from "./lib/env.js";
import { clerkWebhookHandler } from "./webhooks/clerk.js";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });


app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});//Debug

app.post("/webhooks/clerk", rawJson, (req, res) => {
  void clerkWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());


//DOCKER
const publicDir = path.join(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(env?.PORT, () =>
  console.log("Server is running on port: ", env?.PORT),
);
