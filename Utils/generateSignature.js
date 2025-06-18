const crypto = require("crypto");
require("dotenv").config(); 

const order_id = "order_XXXXXXX";              // Replace this with actual or test order ID from response of create-order
const payment_id = "pay_XXXXXXX";              // Replace with a fake or real test payment ID
const secret = process.env.RAZORPAY_KEY_SECRET; //  Loaded securely from .env

if (!secret) {
  console.error("RAZORPAY_KEY_SECRET not found in .env");
  process.exit(1);
}

const hmac = crypto.createHmac("sha256", secret);
hmac.update(order_id + "|" + payment_id);

const signature = hmac.digest("hex");
console.log("Generated Razorpay Signature:", signature);
