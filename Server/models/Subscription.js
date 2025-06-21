const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  razorpay_subscription_id: { type: String, required: true,unique: true },
  razorpay_plan_id: { type: String, required: true },
  status: {
    type: String,
    enum: ["created", "active", "cancelled", "completed", "pending"],
    default: "created"
  },
  current_period_start: Date,
  current_period_end: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
