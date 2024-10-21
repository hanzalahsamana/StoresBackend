const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

mongoose
  .connect(url, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("Mongo DB connected");
    // await renameCollection(); // Call the rename function after connecting
  })
  .catch((err) => {
    console.log("not connected", "error:", err);
  });

// Function to rename the collection
// async function renameCollection() {
//   const adminDb = mongoose.connection.db.admin(); // Get the admin database

//   try {
//     const result = await adminDb.command({
//       renameCollection: "HannanFabrics.products",
//       to: "HannanFabrics.HannanFabrics_products"
//     });
//     console.log('Collection renamed:', result);
//   } catch (err) {
//     console.error('Error renaming collection:', err);
//   }
// }
