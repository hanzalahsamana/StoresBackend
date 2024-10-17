const express = require("express");
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const cors = require("cors");
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

app.use("/api/v1", routes);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
