// async function processPayment(paymentToken) {
//   console.log("👍👍👍👍");

//   const url =
//     "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/4.0/purchase/domwallettransactionviatoken";
//   const merchantId = "MC150798";
//   const password = "3gx5x3y35v";
//   const integritySalt = "xvb2v39vzz";
//   const txnRefNo = `TxnRef${moment().format("YYYYMMDDHHmmss")}`;

//   const amount = "100";
//   const txnCurrency = "PKR";
//   const txnDateTime = moment().format("YYYYMMDDHHmmss");
//   const billReference = "billRef123";
//   const description = "Testpayment";
//   const txnExpiryDateTime = moment().add(1, "days").format("YYYYMMDDHHmmss");
//   const cnic = "4121545787646";
//   const mobileNo = "03123456789";
//   const language = "EN";
//   const productId = "";
//   const discountedAmount = "";
//   const subMerchantID = "";
//   const ppmpf1 = "";
//   const ppmpf2 = "";
//   const ppmpf3 = "";
//   const ppmpf4 = "";
//   const ppmpf5 = "";

//   const messageHash = [
//     integritySalt,
//     amount,
//     billReference,
//     description,
//     language,
//     merchantId,
//     password,
//     txnCurrency,
//     txnDateTime,
//     txnExpiryDateTime,
//     txnRefNo,
//   ].join("&");

//   console.log("messageHash", messageHash);

//   const secureHash = `${cryptoJS.HmacSHA256(
//     messageHash,
//     integritySalt
//   )}`.toUpperCase();

//   console.log("secureHash", `${secureHash}`);

//   const requestBody = {
//     pp_MerchantID: merchantId,
//     pp_Password: password,
//     pp_PaymentToken: paymentToken, // The payment token you pass here
//     pp_TxnRefNo: txnRefNo,
//     pp_Amount: amount,
//     pp_TxnCurrency: txnCurrency,
//     pp_TxnDateTime: txnDateTime,
//     pp_BillReference: billReference,
//     pp_Description: description,
//     pp_TxnExpiryDateTime: txnExpiryDateTime,
//     pp_SecureHash: secureHash,
//   };

//   console.log("requestBody", JSON.stringify(requestBody));

//   try {
//     // Send the request to JazzCash API
//     const { data: response } = await axios.post(url, requestBody);

//     console.log("response🧲", JSON.stringify(response));
//     return response; // You can return this to the calling function
//   } catch (error) {
//     console.error("Error with payment request:", error);
//     throw new Error("Payment request failed");
//   }
// }

const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");

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
  const returnURL = "http://127.0.0.1:3000/";

  const payload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: txnRefNo,
    pp_Amount: amount.toString(),
    pp_TxnCurrency: txnCurrency,
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: billReference,
    pp_Description: description,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_ReturnURL: returnURL,
    ppmpf_1: "03001234567", // test sender number
    ppmpf_2: "03001234568", // test receiver number
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // ✅ Filter out empty values and pp_SecureHash
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([key, value]) => key !== "pp_SecureHash" && value !== ""
    )
  );

  // ✅ Sort keys alphabetically
  const sortedKeys = Object.keys(filteredPayload).sort();

  // ✅ Build string: integritySalt&value1&value2&...
  const stringToHash =
    integritySalt +
    "&" +
    sortedKeys.map((key) => filteredPayload[key]).join("&");

  // ✅ Generate HMAC SHA256 hash (UPPERCASE hex)
  const secureHash = crypto
    .createHmac("sha256", integritySalt)
    .update(stringToHash)
    .digest("hex")
    .toUpperCase();

  const finalPayload = {
    ...payload,
    pp_SecureHash: secureHash,
  };

  try {
    const response = await axios.post(
      "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction",
      finalPayload
    );

    if (response.data?.pp_ResponseCode === "000") {
      console.info("✅ Payment token generated:", response.data);
      return response.data;
    } else {
      console.error("❌ JazzCash Error:", response.data);
      throw new Error(response.data.pp_ResponseMessage || "Transaction Failed");
    }
  } catch (error) {
    console.error("❌ Request Error:", error?.response?.data || error.message);
    throw new Error("Failed to generate payment token");
  }
}

const initiateJazzCashPayment = (req, res) => {
  try {
    const amountRupees = req.body.amount || "500"; // Rs
    const amount = (parseInt(amountRupees, 10) * 100).toString(); // convert to paisas

    const integritySalt = "xvb2v39vzz";
    const merchantId = "MC150798";
    const password = "3gx5x3y35v";
    const returnURL = "https://abcd-3.webx.pk/PaymentResponse.aspx";

    const txnRef = `T${moment().format("YYYYMMDDHHmmss")}`;
    const txnDateTime = moment().format("YYYYMMDDHHmmss");
    const txnExpiry = moment().add(1, "days").format("YYYYMMDDHHmmss");

    const payload = {
      pp_Version: "1.1",
      // pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantId,
      pp_SubMerchantID: "",
      pp_Password: password,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: txnRef,
      pp_Amount: amount,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: "billRef123",
      pp_Description: "Test Payment",
      pp_TxnExpiryDateTime: txnExpiry,
      pp_ReturnURL: returnURL,
      // ppmpf_1: "03123456789",
      // ppmpf_2: "03001234567",
      // ppmpf_3: "",
      // ppmpf_4: "",
      // ppmpf_5: "",
    };

    // ✅ Filter out empty/null values and exclude pp_SecureHash
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) =>
          key !== "pp_SecureHash" &&
          value !== "" &&
          value !== null &&
          value !== undefined
      )
    );

    // ✅ Sort keys alphabetically
    const sortedKeys = Object.keys(filteredPayload).sort();

    // ✅ Build the string for hash generation
    const stringToHash =
      integritySalt + "&" + sortedKeys.map((key) => filteredPayload[key]).join("&");

    // ✅ Create the secure hash
    const secureHash = crypto
      .createHmac("sha256", integritySalt)
      .update(stringToHash)
      .digest("hex")
      .toUpperCase();

    payload.pp_SecureHash = secureHash;

    res.status(200).json(payload);
  } catch (error) {
    console.error("JazzCash Initiation Error:", error);
    res.status(500).json({ message: "Something went wrong during payment initiation." });
  }
};

module.exports = { generatePaymentToken, initiateJazzCashPayment };
