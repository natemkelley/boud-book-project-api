require("dotenv").config();

import { Express } from "express";

export default (app: Express) => {
  const path = `/.well-known/acme-challenge/${process.env.ENCRYPT_PATH}`;
  app.get(path, async (req, res) => {
    const secretKeys = process.env.ENCRYPT_KEY;
    res.send(secretKeys);
  });
};
