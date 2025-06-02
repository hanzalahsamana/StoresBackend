const express = require("express");
const multer = require("multer");
const tokenChecker = require("../middlewear/TokenChecker");

const {
  uploadSingleImage,
  uploadMultipleImages,
} = require("../Utils/ImageUpload");
const {
  userLoginValidate,
  userRegisterValidate,
} = require("../Utils/userValidate");
const importSiteData = require("../Utils/ImportSite");

const {
  loginUser,
  sendOtp,
  verifyOtp,
  getUserFromToken,
  registerUser,
  authWithGoogle,
} = require("../Controler/user");


const {
  addCarts,
  getCartData,
  deleteCartProduct,
} = require("../Controler/carts");
const {
  addOrderData,
  getOrders,
  editOrderData,
} = require("../Controler/Order");
const { addReview, getReviews } = require("../Controler/reviews");
const { getAnalyticsData } = require("../Controler/analytics");
const { getPages, updatePage } = require("../Controler/pages");
const { postConatctForm } = require("../Controler/Contact");
const {
  handleDomainRequest,
  automateDomainSetup,
  fetchSiteByDomain,
  removeDomainFromDatabase,
} = require("../Controler/domain");
const { uploadSingle, uploadMultiple } = require("../Controler/imageUpload");
const { addTheme } = require("../Controler/Theme");
const { exportSite } = require("../Controler/migration");
const {
  deleteVariation,
  addVariation,
  editVariation,
} = require("../Controler/variation");
const { getStoreDetails, generateStore } = require("../Controler/StoreDetail");
const {
  addDiscount,
  deleteDiscount,
  editDiscount,
  applyCoupon,
} = require("../Controler/discounts");
const {
  addAnnouncement,
  deleteAnnouncement,
} = require("../Controler/announcement");
const addSubscriber = require("../Controler/subscribe");
const validOwnerChecker = require("../middlewear/ValidOwnerChecker");
const validateProduct = require("../middlewear/ValidationsMiddleware/ValidateProduct");
const ValidStoreChecker = require("../middlewear/ValidStoreChecker");
const { addProduct, deleteProduct, editProduct, getProducts } = require("../Controler/product");
const { addCollection, getCollections, deleteCollection, editCollection } = require("../Controler/Collection");
const validateCollection = require("../middlewear/ValidationsMiddleware/ValidateCollection");
const { addSection, getSections, deleteSection, editSection, updateSectionOrder } = require("../Controler/Sections");

// Multer setup
const upload = multer({ dest: "/tmp" });

// Routers
const withParams = express.Router({ mergeParams: true });
const withoutParams = express.Router();












// --- AUTH ROUTES ---
withoutParams.post("/login", userLoginValidate, loginUser);
withoutParams.post("/sendOtp", sendOtp);
withoutParams.post("/verifyOtp", verifyOtp);
withoutParams.post("/register", userRegisterValidate, registerUser);
withoutParams.post("/authWithGoogle", authWithGoogle);
withoutParams.get("/getUserFromToken", tokenChecker, getUserFromToken);

// --- PRODUCT ROUTES ---
withParams.post("/addProduct", tokenChecker, validOwnerChecker, validateProduct, addProduct);
withParams.get("/getProducts", ValidStoreChecker, getProducts);
withParams.delete("/deleteProduct", tokenChecker, validOwnerChecker, deleteProduct);
withParams.put("/editProduct", tokenChecker, validOwnerChecker, validateProduct(true), editProduct);

// --- CATEGORY / COLLECTION ROUTES ---
withParams.post("/addCollection", tokenChecker, validOwnerChecker, validateCollection, addCollection);
withParams.get("/getCollections", ValidStoreChecker, getCollections);
withParams.delete("/deleteCollection", tokenChecker, validOwnerChecker, deleteCollection);
withParams.put("/editCollection", tokenChecker, validOwnerChecker, validateCollection(true), editCollection);

// --- SECTION ROUTES ---
withParams.post("/addSection", tokenChecker, validOwnerChecker, addSection);
withParams.get("/getSections", ValidStoreChecker, getSections);
withParams.delete("/deleteSection", tokenChecker, validOwnerChecker, deleteSection);
withParams.patch("/editSection", tokenChecker, validOwnerChecker, editSection);
withParams.patch("/editSectionOrder", tokenChecker, validOwnerChecker, updateSectionOrder);

// --- CART ROUTES ---
withParams.post("/addCart", addCarts);
withParams.get("/getCartData", ValidStoreChecker, getCartData);
withParams.delete("/deleteCartProduct", deleteCartProduct);

// --- ORDER ROUTES ---
withParams.post("/addOrderData", addOrderData);
withParams.get("/getOrders", ValidStoreChecker, getOrders);
withParams.put("/editOrder", editOrderData);

// --- REVIEW ROUTES ---
withParams.post("/addReview", addReview);
withParams.get("/getReviews", ValidStoreChecker, getReviews);

// --- STORE / THEME / ANALYTICS ROUTES ---
withoutParams.post("/setTheme", tokenChecker, addTheme);
withParams.get("/getAnalytics", ValidStoreChecker, getAnalyticsData);
withParams.get("/getStoreDetails", ValidStoreChecker, getStoreDetails);

// --- UPLOAD ROUTES ---
withParams.post("/uploadSingle", uploadSingle, uploadSingleImage);
withParams.post("/uploadMultiple", uploadMultiple, uploadMultipleImages);
withoutParams.post("/importSiteData", tokenChecker, upload.single("file"), importSiteData);
withoutParams.get("/exportSiteData", tokenChecker, exportSite);

// --- DOMAIN ROUTES ---
withParams.post("/addDomainDns", handleDomainRequest);
withParams.post("/genrateSSl", automateDomainSetup);
withParams.delete("/deleteDomain", removeDomainFromDatabase);
withoutParams.get("/fetchSiteByDomain", fetchSiteByDomain);

// --- DISCOUNT ROUTES ---
withoutParams.post("/addDiscount", tokenChecker, addDiscount);
withoutParams.delete("/deleteDiscount", tokenChecker, deleteDiscount);
withoutParams.patch("/editDiscount", tokenChecker, editDiscount);

// --- ANNOUNCEMENT ROUTES ---
withoutParams.post("/addAnnouncement", tokenChecker, addAnnouncement);
withoutParams.delete("/deleteAnnouncement", tokenChecker, deleteAnnouncement);

// --- VARIATION ROUTES ---
withoutParams.post("/addVariation", tokenChecker, addVariation);
withoutParams.delete("/deleteVariation", tokenChecker, deleteVariation);
withoutParams.patch("/editVariation", tokenChecker, editVariation);

// --- SUBSCRIBER ROUTES ---
withParams.post("/addSubscriber", addSubscriber);

// --- MISC / UTILITIES ---
withoutParams.post("/generateStore", tokenChecker, generateStore);
withParams.get("/getPages", ValidStoreChecker, getPages);
withParams.patch("/editPage", updatePage);
withParams.get("/ping", async (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(503).send("MongoDB Unreachable");
  }
});


module.exports = {
  withParams,
  withoutParams,
};
