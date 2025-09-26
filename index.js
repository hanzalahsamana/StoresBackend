const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const { withParams, withoutParams } = require("./routes/routes");
const { exampleEmail } = require("./Helpers/EmailsToSend");
require("./Config/Database");
require("./Jobs");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello from the backend");
});

app.use("/api/v1/:storeId", withParams);
app.use("/api/v1", withoutParams);

// exampleEmail();

// generatePaymentToken(123);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 1234;
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
