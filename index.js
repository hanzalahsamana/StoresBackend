const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const { withParams, withoutParams } = require("./routes/routes");
const { generatePaymentToken } = require("./Controller/payment");
require("./Config/Database");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

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

app.use("/api/v1/:storeId", withParams);
app.use("/api/v1", withoutParams);

// generatePaymentToken(123);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 1234;
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;


