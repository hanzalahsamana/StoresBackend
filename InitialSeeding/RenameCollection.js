const renameCollection = async () => {
  const adminDb = mongoose.connection.db.admin();

  try {
    const result = await adminDb.command({
      renameCollection: "HannanFabrics.products", //From Name
      to: "HannanFabrics.HannanFabrics_products", //To Name
    });
  } catch (err) {
    console.error("Error renaming collection:", err);
  }
};

module.exports = renameCollection;
