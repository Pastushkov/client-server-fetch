const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const PORT = 5000;
const REQUESTS_LIMIT = 50;

let requestCount = 0;

setInterval(() => {
  requestCount = 0;
}, 1000);

app.get("/api", async (req, res) => {
  requestCount++;

  if (requestCount > REQUESTS_LIMIT) {
    return res.status(429).send("Too many requests");
  }

  const delay = Math.floor(Math.random() * 1000);
  const index = req.query.index;

  setTimeout(() => {
    res.send({ index });
  }, delay);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
