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
            receipt: `receipt_order_${Math.random().toString(36).slice(2)}`,
            notes: {
              userId: req.user.id,
            }
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




exports.createSubscription = async (req, res) => {
  try {
    const { planId } = req.body;

    const createdSubscription = await instance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles (e.g. monthly = 1 year),
      notes: {
        userId: req.user.id,
      }
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
      duration
    } = req.body;

    // Step 1: Generate expected signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    const end = duration==='Weekly'? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
    // Step 2: Save subscription to DB
    const subscription = new Subscription({
      user: req.user.id,
      razorpay_subscription_id,
      razorpay_plan_id: req.body.plan_id, // optional but useful
      status: "active",
      current_period_start: new Date(Date.now()), 
      current_period_end: new Date(Date.now() + end), 
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


// Get existing subscriptions 
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions"
    });
  }
};

// NEW: Enhanced method with notifications
exports.getSubscriptionNotifications = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const notifications = [];
    const now = new Date();

    subscriptions.forEach(sub => {
      // Payment due soon (3 days before)
      if (sub.status === 'active') {
        const daysToDue = Math.ceil((sub.current_period_end - now) / (1000 * 60 * 60 * 24));
        if (daysToDue <= 3 && daysToDue > 0) {
          notifications.push({
            type: 'payment_due_soon',
            message: `Payment due in ${daysToDue} day${daysToDue > 1 ? 's' : ''} for subscription ${sub.razorpay_plan_id}`,
            subscriptionId: sub.razorpay_subscription_id,
            severity: 'warning'
          });
        }
      }

      // Payment overdue
      if (sub.status === 'pending') {
        const daysOverdue = Math.ceil((now - sub.current_period_end) / (1000 * 60 * 60 * 24));
        if (daysOverdue > 0) {
          notifications.push({
            type: 'payment_overdue',
            message: `Payment overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} for subscription ${sub.razorpay_plan_id}`,
            subscriptionId: sub.razorpay_subscription_id,
            severity: 'error'
          });
        }
      }

      // Multiple payment failures
      if (sub.payment_failed_count && sub.payment_failed_count >= 2) {
        notifications.push({
          type: 'payment_failed',
          message: `Multiple payment failures (${sub.payment_failed_count}) for subscription ${sub.razorpay_plan_id}`,
          subscriptionId: sub.razorpay_subscription_id,
          severity: 'error'
        });
      }
    });

    res.json({
      success: true,
      subscriptions,
      notifications
    });

  } catch (error) {
    console.error('Error fetching subscription notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription notifications' 
    });
  }
};

// NEW: Sync subscription status with Razorpay
exports.syncSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Fetch latest status from Razorpay
    const razorpaySubscription = await instance.subscriptions.fetch(subscriptionId);
    
    // Update local database
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionId,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Update subscription with latest data from Razorpay
    subscription.status = razorpaySubscription.status;
    subscription.current_period_start = new Date(razorpaySubscription.current_start * 1000);
    subscription.current_period_end = new Date(razorpaySubscription.current_end * 1000);
    
    // Update additional fields if available
    if (razorpaySubscription.paid_count) {
      subscription.paid_count = razorpaySubscription.paid_count;
    }
    if (razorpaySubscription.remaining_count) {
      subscription.remaining_count = razorpaySubscription.remaining_count;
    }
    
    await subscription.save();

    res.json({
      success: true,
      subscription,
      message: 'Subscription status synced successfully'
    });

  } catch (error) {
    console.error('Error syncing subscription status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync subscription status' 
    });
  }
};

// NEW: Get detailed subscription info
exports.getSubscriptionDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionId,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Optionally fetch fresh data from Razorpay
    try {
      const razorpaySubscription = await instance.subscriptions.fetch(subscriptionId);
      
      res.json({
        success: true,
        subscription: {
          ...subscription.toObject(),
          razorpay_data: razorpaySubscription
        }
      });
    } catch (razorpayError) {
      // If Razorpay fetch fails, return local data only
      res.json({
        success: true,
        subscription
      });
    }

  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription details' 
    });
  }
};

// NEW: Update subscription (pause/resume)
exports.updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { action } = req.body;

    if (!['pause', 'resume'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Use "pause" or "resume"' 
      });
    }

    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionId,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    let razorpayResponse;
    
    if (action === 'pause') {
      razorpayResponse = await instance.subscriptions.pause(subscriptionId, {
        pause_at: 'now'
      });
      subscription.status = 'halted';
    } else if (action === 'resume') {
      razorpayResponse = await instance.subscriptions.resume(subscriptionId, {
        resume_at: 'now'
      });
      subscription.status = 'active';
    }

    await subscription.save();

    res.json({
      success: true,
      subscription,
      message: `Subscription ${action}d successfully`
    });

  } catch (error) {
    console.error(`Error ${req.body.action}ing subscription:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to ${req.body.action} subscription` 
    });
  }
};

// NEW: Get subscription payment history
exports.getSubscriptionPayments = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionId,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Fetch payments from Razorpay
    const payments = await instance.subscriptions.fetchAllPayments(subscriptionId);

    res.json({
      success: true,
      payments: payments.items || []
    });

  } catch (error) {
    console.error('Error fetching subscription payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription payments' 
    });
  }
};

// NEW: Handle subscription webhooks
exports.handleSubscriptionWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    console.log(`Processing webhook event: ${event}`);
    
    switch (event) {
      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity, payload.payment.entity);
        break;
      
      case 'subscription.payment.failed':
        await handleSubscriptionPaymentFailed(payload.subscription.entity);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;
      
      case 'subscription.completed':
        await handleSubscriptionCompleted(payload.subscription.entity);
        break;
      
      case 'subscription.pending':
        await handleSubscriptionPending(payload.subscription.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Webhook helper functions 
const handleSubscriptionCharged = async (subscriptionData, paymentData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionData.id
    });
    
    if (!subscription) {
      console.log(`Subscription not found: ${subscriptionData.id}`);
      return;
    }

    subscription.status = 'active';
    subscription.current_period_start = new Date(subscriptionData.current_start * 1000);
    subscription.current_period_end = new Date(subscriptionData.current_end * 1000);
    subscription.last_payment_date = new Date();
    subscription.last_payment_amount = paymentData.amount / 100;
    subscription.payment_failed_count = 0; // Reset failure count on successful payment
    
    await subscription.save();
    console.log(`Subscription charged successfully: ${subscriptionData.id}`);

  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
};

const handleSubscriptionPaymentFailed = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionData.id
    });
    
    if (!subscription) {
      console.log(`Subscription not found: ${subscriptionData.id}`);
      return;
    }

    subscription.status = 'pending';
    subscription.payment_failed_count = (subscription.payment_failed_count || 0) + 1;
    subscription.last_payment_attempt = new Date();
    
    await subscription.save();
    console.log(`Subscription payment failed: ${subscriptionData.id}, Failure count: ${subscription.payment_failed_count}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

const handleSubscriptionCancelled = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionData.id
    });
    
    if (!subscription) {
      console.log(`Subscription not found: ${subscriptionData.id}`);
      return;
    }

    subscription.status = 'cancelled';
    subscription.cancelled_at = new Date();
    
    await subscription.save();
    console.log(`Subscription cancelled: ${subscriptionData.id}`);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
};

const handleSubscriptionCompleted = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionData.id
    });
    
    if (!subscription) {
      console.log(`Subscription not found: ${subscriptionData.id}`);
      return;
    }

    subscription.status = 'completed';
    subscription.completed_at = new Date();
    
    await subscription.save();
    console.log(`Subscription completed: ${subscriptionData.id}`);

  } catch (error) {
    console.error('Error handling subscription completion:', error);
  }
};

const handleSubscriptionPending = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpay_subscription_id: subscriptionData.id
    });
    
    if (!subscription) {
      console.log(`Subscription not found: ${subscriptionData.id}`);
      return;
    }

    subscription.status = 'pending';
    subscription.payment_due_date = new Date(subscriptionData.current_end * 1000);
    
    await subscription.save();
    console.log(`Subscription pending: ${subscriptionData.id}`);

  } catch (error) {
    console.error('Error handling subscription pending:', error);
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    // Call Razorpay API to cancel
     await instance.subscriptions.cancel(subscriptionId);
    await Subscription.findOneAndUpdate(
      { razorpay_subscription_id: subscriptionId },
      { status: 'cancelled' }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
};