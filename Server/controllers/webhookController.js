require("dotenv").config(); 
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Subscription = require("../models/Subscription")

// Webhook Controller

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const digest = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");
    if (digest !== signature) {
      console.warn("❌ Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());
    const { event: eventType, payload } = event;

    console.log("📦 Webhook received:", eventType);

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const transaction = new Transaction({
          amount: payment.amount / 100,
          currency: payment.currency,
          paymentId: payment.id,
          status: "success",
          createdAt: payment.created_at
          ? new Date(payment.created_at * 1000)
          : new Date(),
        });
        await transaction.save();
        console.log("✅ Transaction saved:", transaction._id);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        console.warn("❌ Payment failed:", payment.id);
        break;
      }

      case "subscription.activated": {
        const sub = payload.subscription.entity;
        const newSub = new Subscription({
          razorpay_subscription_id: sub.id,
          razorpay_plan_id: sub.plan_id,
          status: sub.status,
          current_period_start: new Date(sub.current_start * 1000),
          current_period_end: new Date(sub.current_end * 1000),
        });
        await newSub.save();
        console.log("✅ Subscription saved:", newSub._id);
        break;
      }

      case "subscription.completed":
        console.log("🧾 Subscription completed:", payload.subscription.entity.id);
        break;

      default:
        console.log("ℹ️ Unhandled event:", eventType);
    }

    res.status(200).json({ success: true, message: "Webhook handled" });
  } catch (err) {
    console.error("🚨 Webhook error:", err);
    res.status(500).json({ success: false, message: "Webhook error" });
  }
};