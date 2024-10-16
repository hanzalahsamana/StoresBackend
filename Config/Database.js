const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

mongoose
  .connect(url, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    connectTimeoutMS: 30000, // increase to 30 seconds
    socketTimeoutMS: 45000, // increase to 45 seconds
  })  
  .then(() => {
    console.log("Mongo DB connected");
  })
  .catch((err) => {
    console.log("not connected", "error:", err);
  });
