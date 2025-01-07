const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { withParams, withoutParams } = require("./routes/routes");
require("dotenv").config();
require("./Config/Database");

const app = express();

app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend");
});

app.use("/api/v1/:type", (req, res, next) => {
  const type = req.params.type;
  req.collectionType = type;
  next();
});

app.use("/api/v1/:type", withParams);
app.use("/api/v1", withoutParams);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
