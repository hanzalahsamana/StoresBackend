const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const { withParams, withoutParams } = require("./routes/routes");
const { processPayment, generatePaymentToken } = require("./Controler/payment");
const importSiteData = require("./Utils/ImportSite");
require("./Config/Database");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

app.use("/api/v1/:type", (req, res, next) => {
  const type = req.params.type;
  req.collectionType = type;
  next();
});

app.use("/api/v1/:type", withParams);
app.use("/api/v1", withoutParams);
const secretKey = process.env.SECRET;
console.log(secretKey, " 🫀");

// processPayment('your_payment_token_here')

// generatePaymentToken(100)
// exportSiteData('Fiztees')
// importSiteData("Fiztees", "exports/Fiztees_data.csv")
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 1234;
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
