import express from "express";
import arScoreHandler from "./handlers/ar";
import cors from "./express/cors";
import morgan from "./express/morgan";
import httpsServer, { certbot } from "./express/https";

const app = express();

cors(app);
certbot(app);
morgan(app);

app.get("/", async (req, res) => {
  const author = req.query.author as string;
  const title = req.query.title as string;
  if (!title) {
    res.send({ error: "no title" });
    return;
  }
  const result = await arScoreHandler(title, author).catch(err => err);
  res.send(result);
});

app.get("/heartbeat", async (req, res) => {
  console.log("unce unce unce");
  res.send(true);
});

httpsServer(app);
