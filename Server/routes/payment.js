const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getTransactions ,
        createSubscription, verifySubscription, getSubscriptions,
        cancelSubscription
    } = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/transactions", auth, getTransactions); 
router.post("/subscribe", auth, createSubscription);
router.post("/verify-subscription", auth, verifySubscription);
router.get("/subscriptions", auth, getSubscriptions);
router.post("/subscription/cancel", auth, cancelSubscription);
module.exports = router;
