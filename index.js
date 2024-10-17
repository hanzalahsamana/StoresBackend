const express = require("express");
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./Config/Database");

const app = express();

// Middleware setup
app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from the backend");
});

app.use("/api/v1", routes);

// Conditionally listen to the port in local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for Vercel deployment
module.exports = app;
