const express = require('express');
const multer = require('multer');

// File upload helpers
const { uploadSingleImage, uploadMultipleImages } = require('../Helpers/ImageUpload');
const importSiteData = require('../Helpers/ImportSite');

// Validation middleware
const { userLoginValidate, userRegisterValidate } = require('../Middleware/ValidationsMiddleware/UserValidation');
const validateProduct = require('../Middleware/ValidationsMiddleware/ProductValidation');
const validateCollection = require('../Middleware/ValidationsMiddleware/CollectionValidation');
const validateReview = require('../Middleware/ValidationsMiddleware/ReviewValidation');
const ValidatContent = require('../Middleware/ValidationsMiddleware/ContentValidation');
const { validateOrder } = require('../Middleware/ValidationsMiddleware/OrderValidation');
const { validateDiscount } = require('../Middleware/ValidationsMiddleware/DiscountValidation');
const { validatePaymentMethod } = require('../Middleware/ValidationsMiddleware/PaymentMethodValidation');

// Auth and validation middlewares
const tokenChecker = require('../Middleware/TokenChecker');
const validOwnerChecker = require('../Middleware/ValidOwnerChecker');
const ValidStoreChecker = require('../Middleware/ValidStoreChecker');

// Controllers - Auth
const { loginUser, sendOtp, verifyOtp, getUserFromToken, registerUser, authWithGoogle } = require('../Controller/user');

// Controllers - Store
const { generateStore, getAllStores, getStore } = require('../Controller/StoreDetail');

// Controllers - Product
const { addProduct, deleteProduct, editProduct, getProducts, productSearchSuggestion } = require('../Controller/Product');

// Controllers - Collection
const { addCollection, getCollections, deleteCollection, editCollection, collectionSearchSuggestion } = require('../Controller/Collection');

// Controllers - Section
const { addSection, getSections, deleteSection, editSection, changeSectionOrder } = require('../Controller/Sections');

// Controllers - Review
const { addReview, getReviews, deleteReview } = require('../Controller/Reviews');

// Controllers - Content
const { getContents, editContent } = require('../Controller/Content');

// Controllers - Cart
const { addToCart, getCartdata, deleteCartData } = require('../Controller/Cart');

// Controllers - Order
const { placeOrder, getOrders, editOrderData } = require('../Controller/Order');

// Controllers - Payment
// const { initiateJazzCashPayment } = require('../Controller/payment');

// Controllers - Theme
const { addTheme, updateTheme } = require('../Controller/StoreConfigurations/ThemeSetting');

// Controllers - Payment Method
const { updatePaymentMethod, getHashedPaymentCredential } = require('../Controller/StoreConfigurations/PaymentMethod');

// Controllers - Configuration
const { getAdminConfiguration, getPublicConfiguration } = require('../Controller/StoreConfigurations/Configuration');

// Controllers - Discount
const { addDiscount, deleteDiscount, editDiscount, applyCoupon } = require('../Controller/StoreConfigurations/discounts');

// Controllers - Announcement
const { addAnnouncement, deleteAnnouncement } = require('../Controller/announcement');

// Controllers - Subscriber
const addSubscriber = require('../Controller/subscribe');

// Controllers - Domain
const { handleDomainRequest, automateDomainSetup, removeDomainFromDatabase, getStoreByDomain } = require('../Controller/domain');

// Controllers - Upload / Migration
const { uploadSingle, uploadMultiple } = require('../Controller/imageUpload');
const { exportSite } = require('../Controller/migration');

// Controllers - Analytics / Contact
const { getAnalyticsData } = require('../Controller/analytics');
const { postConatctForm, getContactedUsers } = require('../Controller/Contact');
const { getHomePageData } = require('../Controller/pages/homePage');
const { validateSection } = require('../Middleware/ValidationsMiddleware/sectionsValidation');
const { deleteStore } = require('../Controller/StoreConfigurations/deleteStore');

// // Variations (commented for now)
// const { deleteVariation, addVariation, editVariation } = require("../Controller/StoreConfigurations/variation");

// Multer setup
const upload = multer({ dest: '/tmp' });

// Routers
const withParams = express.Router({ mergeParams: true });
const withoutParams = express.Router();
// --- AUTH ROUTES ---
withoutParams.post('/login', userLoginValidate, loginUser);
withoutParams.post('/sendOtp', sendOtp);
withoutParams.post('/verifyOtp', verifyOtp);
withoutParams.post('/register', userRegisterValidate, registerUser);
withoutParams.post('/authWithGoogle', authWithGoogle);
withoutParams.get('/getUserFromToken', tokenChecker, getUserFromToken);

// --- STORE ROUTES ---
withoutParams.post('/generateStore', tokenChecker, generateStore);
withParams.get('/getStore', ValidStoreChecker, getStore);
withoutParams.get('/getAllStores', tokenChecker, getAllStores);

// --- PRODUCT ROUTES ---
withParams.post('/addProduct', tokenChecker, validOwnerChecker, validateProduct(false), addProduct);
withParams.get('/getProducts', ValidStoreChecker, getProducts);
withParams.delete('/deleteProduct', tokenChecker, validOwnerChecker, deleteProduct);
withParams.put('/editProduct', tokenChecker, validOwnerChecker, validateProduct(true), editProduct);

// --- COLLECTION ROUTES ---
withParams.post('/addCollection', tokenChecker, validOwnerChecker, validateCollection(false), addCollection);
withParams.get('/getCollections', ValidStoreChecker, getCollections);
withParams.delete('/deleteCollection', tokenChecker, validOwnerChecker, deleteCollection);
withParams.put('/editCollection', tokenChecker, validOwnerChecker, validateCollection(true), editCollection);

// --- REVIEW ROUTES ---
withParams.post('/addReview', ValidStoreChecker, validateReview, addReview);
withParams.get('/getReviews', ValidStoreChecker, getReviews);
withParams.delete('/deleteReview', tokenChecker, validOwnerChecker, deleteReview);

// --- SECTION ROUTES ---
withParams.post('/addSection', tokenChecker, validOwnerChecker, validateSection, addSection);
withParams.get('/getSections', ValidStoreChecker, getSections);
withParams.delete('/deleteSection', tokenChecker, validOwnerChecker, deleteSection);
withParams.patch('/editSection', tokenChecker, validOwnerChecker, editSection);
withParams.patch('/changeSectionOrder', tokenChecker, validOwnerChecker, changeSectionOrder);

// --- CONTENT ROUTES ---
withParams.get('/getContents', ValidStoreChecker, getContents);
withParams.patch('/editContent', tokenChecker, validOwnerChecker, ValidatContent, editContent);

// --- ORDER ROUTES ---
withParams.post('/placeOrder', ValidStoreChecker, validateOrder, placeOrder);
withParams.get('/getOrders', ValidStoreChecker, getOrders);
withParams.put('/editOrder', editOrderData);

// --- CART ROUTES ---
withParams.post('/addToCart', ValidStoreChecker, addToCart);
withParams.get('/getCartdata', ValidStoreChecker, getCartdata);
withParams.delete('/deleteCartData', ValidStoreChecker, deleteCartData);

// --- STORE CONFIGURATION ROUTES ---
withParams.get('/getAdminConfiguration', tokenChecker, validOwnerChecker, getAdminConfiguration);
withParams.get('/getPublicConfiguration', ValidStoreChecker, getPublicConfiguration);

// --- PAYMENT METHODS ROUTES ---
withParams.patch('/updatePaymentMethod', tokenChecker, validOwnerChecker, validatePaymentMethod, updatePaymentMethod);
withParams.get('/getHashedPaymentCredential', ValidStoreChecker, getHashedPaymentCredential);

// --- THEME / ANALYTICS ROUTES ---
withoutParams.post('/setTheme', tokenChecker, updateTheme);
withParams.get('/getAnalytics', tokenChecker, validOwnerChecker, getAnalyticsData);

// --- UPLOAD ROUTES ---
withParams.post('/uploadSingle', tokenChecker, validOwnerChecker, uploadSingle, uploadSingleImage);
withParams.post('/uploadMultiple', tokenChecker, validOwnerChecker, uploadMultiple, uploadMultipleImages);
withoutParams.post('/importSiteData', tokenChecker, upload.single('file'), importSiteData);
withoutParams.get('/exportSiteData', tokenChecker, exportSite);

// --- DOMAIN ROUTES ---
withParams.post('/addDomainDns', handleDomainRequest);
withParams.post('/genrateSSl', automateDomainSetup);
withParams.delete('/deleteDomain', removeDomainFromDatabase);
withoutParams.get('/getStoreByDomain', getStoreByDomain);

// --- DISCOUNT ROUTES ---
withParams.post('/addDiscount', tokenChecker, validOwnerChecker, validateDiscount(false), addDiscount);
withParams.delete('/deleteDiscount', tokenChecker, validOwnerChecker, deleteDiscount);
withParams.patch('/editDiscount', tokenChecker, validOwnerChecker, validateDiscount(true), editDiscount);
withParams.post('/applyCoupon', ValidStoreChecker, applyCoupon);

// --- ANNOUNCEMENT ROUTES ---
withoutParams.post('/addAnnouncement', tokenChecker, addAnnouncement);
withoutParams.delete('/deleteAnnouncement', tokenChecker, deleteAnnouncement);

// --- SEARCH SUGGESTION ROUTES ---
withParams.get('/search/products', ValidStoreChecker, productSearchSuggestion);
withParams.get('/search/collections', ValidStoreChecker, collectionSearchSuggestion);

// --- Home Page ROUTES ---
withParams.get('/pages/home', ValidStoreChecker, getHomePageData);

// --- Profile Page ROUTES ---
withParams.delete('/delete/store', tokenChecker, validOwnerChecker, deleteStore);

// --- SUBSCRIBER ROUTES ---
withParams.post('/addSubscriber', ValidStoreChecker, addSubscriber);

// --- Contact ROUTES ---
withParams.post('/contact-us', ValidStoreChecker, postConatctForm);
withParams.get('/contacted-users', ValidStoreChecker, getContactedUsers);

// --- MISC / UTILITIES ---
withParams.get('/ping', async (req, res) => {
  try {
    res.status(200).send('OK');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).send('MongoDB Unreachable');
  }
});

withoutParams.post('/jazzcash', async (req, res) => {
  try {
    console.log('JazzCash endpoint hit');
    console.log('request body😰', req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).send('MongoDB Unreachable');
  }
});

// withoutParams.post('/jazzcash-initiate', initiateJazzCashPayment);

module.exports = {
  withParams,
  withoutParams,
};
