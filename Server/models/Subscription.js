
const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpay_subscription_id: {
    type: String,
    required: true,
    unique: true // this creates a unique index internally
  },
  razorpay_plan_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'cancelled', 'completed', 'paused'],
    default: 'pending'
  },
  current_period_start: {
    type: Date,
    required: true
  },
  current_period_end: {
    type: Date,
    required: true
  },
  last_payment_date: Date,
  last_payment_amount: Number,
  payment_failed_count: {
    type: Number,
    default: 0
  },
  last_payment_attempt: Date,
  payment_due_date: Date,
  cancelled_at: Date,
  completed_at: Date,
  plan_details: {
    name: String,
    amount: Number,
    currency: String,
    interval: String
  },
  customer_details: {
    email: String,
    contact: String
  }
}, {
  timestamps: true
});

// Keep these relevant compound indexes:
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ status: 1, current_period_end: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
