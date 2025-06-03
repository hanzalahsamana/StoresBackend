const mongoose = require("mongoose");

const getModel = (siteName, modelName, schema) => {
  const collectionName = `${siteName}_${modelName}`;
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, schema, collectionName)
  );
};

module.exports = getModel;
