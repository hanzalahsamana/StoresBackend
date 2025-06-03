const axios = require("axios");
const cryptoJS = require("crypto-js");
const moment = require("moment");

async function processPayment(paymentToken) {
  console.log("👍👍👍👍");

  const url =
    "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/4.0/purchase/domwallettransactionviatoken";
  const merchantId = "MC150798";
  const password = "3gx5x3y35v";
  const integritySalt = "xvb2v39vzz";
  const txnRefNo = `TxnRef${moment().format("YYYYMMDDHHmmss")}`;

  const amount = "100";
  const txnCurrency = "PKR";
  const txnDateTime = moment().format("YYYYMMDDHHmmss");
  const billReference = "billRef123";
  const description = "Testpayment";
  const txnExpiryDateTime = moment().add(1, "days").format("YYYYMMDDHHmmss");
  const cnic = "4121545787646";
  const mobileNo = "03123456789";
  const language = "EN";
  const productId = "";
  const discountedAmount = "";
  const subMerchantID = "";
  const ppmpf1 = "";
  const ppmpf2 = "";
  const ppmpf3 = "";
  const ppmpf4 = "";
  const ppmpf5 = "";

  const messageHash = [
    integritySalt,
    amount,
    billReference,
    description,
    language,
    merchantId,
    password,
    txnCurrency,
    txnDateTime,
    txnExpiryDateTime,
    txnRefNo,
  ].join("&");

  console.log("messageHash", messageHash);

  const secureHash = `${cryptoJS.HmacSHA256(
    messageHash,
    integritySalt
  )}`.toUpperCase();

  console.log("secureHash", `${secureHash}`);

  const requestBody = {
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_PaymentToken: paymentToken, // The payment token you pass here
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount,
    pp_TxnCurrency: txnCurrency,
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: billReference,
    pp_Description: description,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_SecureHash: secureHash,
  };

  console.log("requestBody", JSON.stringify(requestBody));

  try {
    // Send the request to JazzCash API
    const { data: response } = await axios.post(url, requestBody);

    console.log("response🧲", JSON.stringify(response));
    return response; // You can return this to the calling function
  } catch (error) {
    console.error("Error with payment request:", error);
    throw new Error("Payment request failed");
  }
}

async function generatePaymentToken(amount) {
  const merchantId = "MC150798";
  const password = "3gx5x3y35v";
  const integritySalt = "xvb2v39vzz";
  const txnRefNo = `TxnRef${moment().format("YYYYMMDDHHmmss")}`;
  const txnCurrency = "PKR";
  const txnDateTime = moment().format("YYYYMMDDHHmmss");
  const txnExpiryDateTime = moment().add(1, "days").format("YYYYMMDDHHmmss");
  const billReference = "billRef123";
  const description = "Test Payment";
  const language = "EN";

  // Create message hash
  const messageHash = [
    integritySalt,
    amount,
    billReference,
    description,
    language,
    merchantId,
    password,
    txnCurrency,
    txnDateTime,
    txnExpiryDateTime,
    txnRefNo,
  ].join("&");

  const secureHash = cryptoJS
    .HmacSHA256(messageHash, integritySalt)
    .toString(cryptoJS.enc.Base64);

  const requestBody = {
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_Amount: amount,
    pp_TxnCurrency: txnCurrency,
    pp_TxnDateTime: txnDateTime,
    pp_TxnRefNo: txnRefNo,
    pp_BillReference: billReference,
    pp_Description: description,
    pp_Language: language,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_SecureHash: secureHash,
  };

  // Make the request to JazzCash API to generate the payment token
  try {
    const response = await axios.post(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/purchase/transactionrequest",
      requestBody
    );

    // JazzCash API will return the payment token in the response
    const paymentToken = response.data.pp_Token;

    console.info("Payment token generated:", paymentToken);
    return paymentToken; // Return the payment token
  } catch (error) {
    console.error("Error generating payment token:", error);
    throw new Error("Failed to generate payment token");
  }
}

module.exports = { generatePaymentToken, processPayment };
