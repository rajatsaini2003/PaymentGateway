require("dotenv").config(); 
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription")
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
    user.password=undefined
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



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;

    const createdSubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles (e.g. monthly = 1 year)
    });

    res.status(200).json({
      success: true,
      subscription: createdSubscription,
    });
  } catch (error) {
    console.error("Subscription creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};



exports.verifySubscription = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    // Step 1: Generate expected signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Step 2: Save subscription to DB
    const subscription = new Subscription({
      user: req.user.id,
      razorpay_subscription_id,
      razorpay_plan_id: req.body.plan_id, // optional but useful
      status: "active",
      current_period_start: new Date(), // Razorpay doesn't send this, so estimate for now
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // e.g., monthly
    });

    await subscription.save();

    // Step 3: Link to user
    const user = await User.findByIdAndUpdate(req.user.id, {
      $push: {
        subscriptions: subscription._id
      }
    });
    user.password=undefined
    return res.status(200).json({
      success: true,
      message: "Subscription verified and saved successfully",
      subscription,
      user
    });
  } catch (error) {
    console.error("Subscription verification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};


exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch subscriptions" 
    });
  }
};



// Webhook Controller
exports.handleWebhook = (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("❌ Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    console.log("📦 Razorpay Webhook Received:", event.event);

    // Placeholder for handling different events
    switch (event.event) {
      case "payment.captured":
        console.log("💰 Payment Captured:", event.payload.payment.entity);
        break;
      case "payment.failed":
        console.log("❌ Payment Failed:", event.payload.payment.entity);
        break;
      case "subscription.charged":
        console.log("🔁 Subscription Charged:", event.payload.payment.entity);
        break;
      case "subscription.completed":
        console.log("✅ Subscription Completed:", event.payload.subscription.entity);
        break;
      default:
        console.log("ℹ️ Unhandled event type");
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    console.error("🚨 Webhook handler error:", err);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
