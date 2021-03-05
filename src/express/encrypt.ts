require("dotenv").config();

import { Express } from "express";
import os from "os";

export default (app: Express) => {
  // ONLY RUN ON RASPBERRY PI
  if (os.platform() !== "darwin") return;

  const path = `/.well-known/acme-challenge/${process.env.ENCRYPT_PATH}`;

  app.get(path, async (req, res) => {
    const secretKeys = process.env.ENCRYPT_KEY;
    res.attachment(secretKeys);
    res.type("txt");
    res.send(secretKeys);
  });
};
