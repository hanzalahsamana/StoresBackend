const express = require('express');
const multer = require('multer');

// Validation middleware
const { validateSection } = require('../Middleware/ValidationsMiddleware/sectionsValidation');
const { editPasswordValidate } = require('../Middleware/ValidationsMiddleware/editPasswordValidate');
const { generateStoreValidation, editStoreValidation } = require('../Middleware/ValidationsMiddleware/StoreValidation');
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
const { loginUser, sendOtp, verifyOtp, getUserFromToken, registerUser, authWithGoogle, editPassword, deleteAccount } = require('../Controller/user');

// Controllers - Store
const { generateStore, getAllStores, getStore, editStore, deleteStore } = require('../Controller/StoreDetail');

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

// Controllers - Migration
const { exportSite, importSite } = require('../Controller/migration');

// Controllers - Upload
const { getImages, uploadImage, deleteImages } = require('../Controller/imageUpload');
const { uploadSingle } = require('../Helpers/s3Uploader');

// Controllers - Pages / homepage
const { getHomePageData } = require('../Controller/pages/homePage');

// Controllers - Analytics / Contact
const { getAnalyticsData } = require('../Controller/analytics');
const { postConatctForm, getContactedUsers } = require('../Controller/Contact');
const { saveDraft, publishPage, getDraftPage, getPublishPage, getAllPages, createPage, discardDraft } = require('../Controller/Theme/Builder');
const { getMenuLinks } = require('../Controller/Suggestions/menuLinks');
const { getAnalyticsData: getDashboardData } = require('../Controller/pages/analytics');
const superAdminChecker = require('../Middleware/superAdminChecker');
const { getUsers, searchUsers } = require('../Controller/pages/users');

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
withoutParams.get('/getAllStores', tokenChecker, getAllStores);
withoutParams.post('/generateStore', tokenChecker, generateStoreValidation, generateStore);
withParams.get('/getStore', ValidStoreChecker, getStore);
withParams.put('/edit/store', tokenChecker, validOwnerChecker, editStoreValidation, editStore);
withParams.delete('/delete/store', tokenChecker, validOwnerChecker, deleteStore);

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

// --- Builder ROUTES ---
withParams.post('/saveDraft', tokenChecker, validOwnerChecker, saveDraft);
withParams.post('/publishPage', tokenChecker, validOwnerChecker, publishPage);
withParams.get('/getPublishPage', ValidStoreChecker, getPublishPage);
withParams.get('/getDraftPage', tokenChecker, validOwnerChecker, getDraftPage);
withParams.post('/discardDraft', tokenChecker, validOwnerChecker, discardDraft);
withParams.get('/getAllPages', tokenChecker, validOwnerChecker, getAllPages);
withParams.post('/createPage', tokenChecker, validOwnerChecker, createPage);

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
withParams.post('/uploadImage', tokenChecker, validOwnerChecker, uploadSingle, uploadImage);
withParams.get('/getImages', tokenChecker, validOwnerChecker, getImages);
withParams.delete('/deleteImages', tokenChecker, validOwnerChecker, deleteImages);

// --- MIGERATION ROUTES ---
withParams.post('/importSiteData', tokenChecker, validOwnerChecker, upload.single('file'), importSite);
withParams.get('/exportSiteData', tokenChecker, validOwnerChecker, exportSite);

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
withParams.get('/search/getMenuLinks', tokenChecker, validOwnerChecker, getMenuLinks);

// --- Home Page ROUTES ---
withParams.get('/pages/home', ValidStoreChecker, getHomePageData);

// --- Profile Page ROUTES ---
withParams.delete('/delete/account', tokenChecker, deleteAccount);
withParams.put('/edit/password', tokenChecker, editPasswordValidate, editPassword);

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

withoutParams.get('/get/analytics/data', tokenChecker, superAdminChecker, getDashboardData);
withoutParams.get('/get/users', tokenChecker, superAdminChecker, getUsers);
withoutParams.get('/search/users', tokenChecker, superAdminChecker, searchUsers);
module.exports = {
  withParams,
  withoutParams,
};
