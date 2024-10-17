const { upload } = require("../middlewear/upload");
const { postProductData, getProductData } = require("../Utils/product");
const express = require("express");


const routes = express.Router();

routes.post("/addProduct",upload, postProductData);
routes.get("/getProducts", getProductData);


module.exports = routes;