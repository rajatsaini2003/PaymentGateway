require("dotenv").config(); 
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

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
      const user = await User.findByIdAndUpdate(req.user.id,{
        $push:{
          transactions:transaction._id
        },
      },
      {new: true}
    )
      return res.status(200).json({
        msg: "Payment verified and recorded",
        user
      });
    } else {
      res.status(400).json({ msg: "Invalid signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Verification failed" });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch transactions"
    });
  }
};
