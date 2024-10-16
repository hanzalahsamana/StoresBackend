const express = require("express");
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const app = express();

const cors = require("cors");
app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  console.log(req.query)
  res.send("Hello from the backend");
});

const PORT = process.env.PORT || 8080;

require("dotenv").config();
require("./Config/DataBase");

app.use(bodyParser.json());
app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`port is runing on this ${PORT} port`);
});
  