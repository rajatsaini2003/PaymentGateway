const crypto = require("crypto");
require("dotenv").config(); 
const payload = JSON.stringify({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test123456",
        amount: 50000,
        currency: "INR",
        status: "captured"
      }
    }
  }
});

const secret = process.env.RAZORPAY_WEBHOOK_SECRET 

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

console.log("Signature:", signature);
console.log("Payload:\n", payload);
