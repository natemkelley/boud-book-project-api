import express from "express";
import arScoreHandler from "./handlers/ar";
import cors from "./express/cors";
import morgan from "./express/morgan";

const app = express();
const port = 8080; // default port to listen

cors(app);
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

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
