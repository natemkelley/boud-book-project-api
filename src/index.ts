import express from "express";
import arScoreHandler from "./handlers/ar";
import cors from "./cors.js";

const app = express();
const port = 8080; // default port to listen

cors(app);

// define a route handler for the default home page
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

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
