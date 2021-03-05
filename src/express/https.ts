require("dotenv").config();

import { Express } from "express";
import https from "https";
import http from "http";
import fs from "fs";
import os from "os";

const IS_RASPBERRY_PI = os.platform() !== "darwin";

export const certbot = (app: Express) => {
  if (IS_RASPBERRY_PI) return;

  const path = `/.well-known/acme-challenge/${process.env.ENCRYPT_PATH}`;

  app.get(path, async (req, res) => {
    const secretKeys = process.env.ENCRYPT_KEY;
    res.attachment(secretKeys);
    res.type("txt");
    res.send(secretKeys);
  });
};

export default (app: Express) => {
  const DEFAULT_PORT = 8080;
  const SECURE_PORT = 8081;
  const TIMEOUT = 1000 * 60 * 2; //2 minutes

  const httpServer = http.createServer(app);
  httpServer
    .listen(DEFAULT_PORT, () => {
      console.log("HTTP Server running on port 8080");
    })
    .setTimeout(TIMEOUT);

  if (IS_RASPBERRY_PI) {
    const websiteURL = process.env.WEBSITE_URL;
    const credentials = {
      key: fs.readFileSync(`/etc/letsencrypt/live/${websiteURL}/privkey.pem`),
      cert: fs.readFileSync(
        `/etc/letsencrypt/live/${websiteURL}/fullchain.pem`
      ),
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer
      .listen(SECURE_PORT, () => {
        console.log("HTTPS Server running on port 8081");
      })
      .setTimeout(TIMEOUT);
  }
};
