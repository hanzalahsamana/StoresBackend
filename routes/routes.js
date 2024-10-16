const { postProductData, getProductData } = require("../Utils/product");
const express = require("express");


const routes = express.Router();

routes.post("/addProduct", postProductData);
routes.get("/getProducts", getProductData);


module.exports = routes;