require("dotenv").config(); 
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async(req,res)=>{
    try {
        const {amount} = req.body;
        const options={
            amount:amount*100,
            currency:'INR',
            receipt: `receipt_order_${Math.random().toString(36).slice(2)}`
        }
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to create Razorpay order" });
    }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      const transaction = new Transaction({
        user: req.user.id,
        amount: req.body.amount,
        currency: "INR",
        paymentId: razorpay_payment_id,
        status: "success"
      });
      await transaction.save();
      res.json({ msg: "Payment verified and recorded" });
    } else {
      res.status(400).json({ msg: "Invalid signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Verification failed" });
  }
};