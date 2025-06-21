const crypto = require("crypto");
require("dotenv").config(); 

const payment_id = "pay_XXXXXXX";
const subscription_id = "sub_XXXXXXX";
const secret = process.env.RAZORPAY_KEY_SECRET; 

const hmac = crypto.createHmac("sha256", secret);
hmac.update(`${payment_id}|${subscription_id}`);

const signature = hmac.digest("hex");
console.log("Generated Signature:", signature);
