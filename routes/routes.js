const express = require("express");
const multer = require("multer");

const {
  uploadSingleImage,
  uploadMultipleImages,
} = require("../Helpers/ImageUpload");
const importSiteData = require("../Helpers/ImportSite");

const {
  userLoginValidate,
  userRegisterValidate,
} = require("../Middleware/ValidationsMiddleware/UserValidation");
const validateProduct = require("../Middleware/ValidationsMiddleware/ProductValidation");
const validateCollection = require("../Middleware/ValidationsMiddleware/CollectionValidation");
const validateReview = require("../Middleware/ValidationsMiddleware/ReviewValidation");
const ValidatContent = require("../Middleware/ValidationsMiddleware/ContentValidation");

const tokenChecker = require("../Middleware/TokenChecker");
const validOwnerChecker = require("../Middleware/ValidOwnerChecker");
const ValidStoreChecker = require("../Middleware/ValidStoreChecker");

const {
  loginUser,
  sendOtp,
  verifyOtp,
  getUserFromToken,
  registerUser,
  authWithGoogle,
} = require("../Controller/user");
const {
  addOrderData,
  getOrders,
  editOrderData,
} = require("../Controller/Order");
const { getAnalyticsData } = require("../Controller/analytics");
const { postConatctForm } = require("../Controller/Contact");
const {
  handleDomainRequest,
  automateDomainSetup,
  removeDomainFromDatabase,
  getStoreByDomain,
} = require("../Controller/domain");
const { uploadSingle, uploadMultiple } = require("../Controller/imageUpload");
const { addTheme } = require("../Controller/Theme");
const { exportSite } = require("../Controller/migration");
const {
  deleteVariation,
  addVariation,
  editVariation,
} = require("../Controller/StoreConfigurations/variation");
const {
  generateStore,
  getAllStores,
  getStore,
} = require("../Controller/StoreDetail");
const {
  addDiscount,
  deleteDiscount,
  editDiscount,
  applyCoupon,
} = require("../Controller/StoreConfigurations/discounts");
const {
  addAnnouncement,
  deleteAnnouncement,
} = require("../Controller/announcement");
const addSubscriber = require("../Controller/subscribe");
const {
  addProduct,
  deleteProduct,
  editProduct,
  getProducts,
} = require("../Controller/Product");
const {
  addCollection,
  getCollections,
  deleteCollection,
  editCollection,
} = require("../Controller/Collection");
const {
  addSection,
  getSections,
  deleteSection,
  editSection,
  changeSectionOrder,
} = require("../Controller/Sections");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../Controller/Reviews");
const { getContents, editContent } = require("../Controller/Content");
const {
  addToCart,
  getCartdata,
  deleteCartData,
} = require("../Controller/Cart");
const { initiateJazzCashPayment } = require("../Controller/payment");

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

// --- Store ROUTE ---
withoutParams.post("/generateStore", tokenChecker, generateStore);
withParams.get("/getStore", ValidStoreChecker, getStore);
withoutParams.get("/getAllStores", tokenChecker, getAllStores);

// --- PRODUCT ROUTES ---
withParams.post(
  "/addProduct",
  tokenChecker,
  validOwnerChecker,
  validateProduct,
  addProduct
);
withParams.get("/getProducts", ValidStoreChecker, getProducts);
withParams.delete(
  "/deleteProduct",
  tokenChecker,
  validOwnerChecker,
  deleteProduct
);
withParams.put(
  "/editProduct",
  tokenChecker,
  validOwnerChecker,
  validateProduct(true),
  editProduct
);

// --- CATEGORY / COLLECTION ROUTES ---
withParams.post(
  "/addCollection",
  tokenChecker,
  validOwnerChecker,
  validateCollection,
  addCollection
);
withParams.get("/getCollections", ValidStoreChecker, getCollections);
withParams.delete(
  "/deleteCollection",
  tokenChecker,
  validOwnerChecker,
  deleteCollection
);
withParams.put(
  "/editCollection",
  tokenChecker,
  validOwnerChecker,
  validateCollection(true),
  editCollection
);

// --- REVIEW ROUTES ---
withParams.post("/addReview", ValidStoreChecker, validateReview, addReview);
withParams.get("/getReviews", ValidStoreChecker, getReviews);
withParams.delete(
  "/deleteReview",
  tokenChecker,
  validOwnerChecker,
  deleteReview
);

// --- SECTION ROUTES ---
withParams.post("/addSection", tokenChecker, validOwnerChecker, addSection);
withParams.get("/getSections", ValidStoreChecker, getSections);
withParams.delete(
  "/deleteSection",
  tokenChecker,
  validOwnerChecker,
  deleteSection
);
withParams.patch("/editSection", tokenChecker, validOwnerChecker, editSection);
withParams.patch(
  "/changeSectionOrder",
  tokenChecker,
  validOwnerChecker,
  changeSectionOrder
);

// --- CONTENT ROUTES ---
withParams.get("/getContents", ValidStoreChecker, getContents);
withParams.patch(
  "/editContent",
  tokenChecker,
  validOwnerChecker,
  ValidatContent,
  editContent
);

// --- ORDER ROUTES ---
withParams.post("/addOrderData", addOrderData);
withParams.get("/getOrders", ValidStoreChecker, getOrders);
withParams.put("/editOrder", editOrderData);

// --- CART ROUTES ---
withParams.post("/addToCart", ValidStoreChecker, addToCart);
withParams.get("/getCartdata", ValidStoreChecker, getCartdata);
withParams.delete("/deleteCartData", ValidStoreChecker, deleteCartData);

// --- STORE / THEME / ANALYTICS ROUTES ---
withoutParams.post("/setTheme", tokenChecker, addTheme);
withParams.get("/getAnalytics", ValidStoreChecker, getAnalyticsData);

// --- UPLOAD ROUTES ---
withParams.post("/uploadSingle", uploadSingle, uploadSingleImage);
withParams.post("/uploadMultiple", uploadMultiple, uploadMultipleImages);
withoutParams.post(
  "/importSiteData",
  tokenChecker,
  upload.single("file"),
  importSiteData
);
withoutParams.get("/exportSiteData", tokenChecker, exportSite);

// --- DOMAIN ROUTES ---
withParams.post("/addDomainDns", handleDomainRequest);
withParams.post("/genrateSSl", automateDomainSetup);
withParams.delete("/deleteDomain", removeDomainFromDatabase);
withoutParams.get("/getStoreByDomain", getStoreByDomain);

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

withParams.get("/ping", async (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(503).send("MongoDB Unreachable");
  }
});

withoutParams.post("/jazzcash-initiate", initiateJazzCashPayment);

module.exports = {
  withParams,
  withoutParams,
};
