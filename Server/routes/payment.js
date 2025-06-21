const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getTransactions ,
        createSubscription, verifySubscription, getSubscriptions
    } = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);
router.get("/transactions", auth, getTransactions); 
router.post("/subscribe", auth, createSubscription);
router.post("/verify-subscription", auth, verifySubscription);
router.get("/subscriptions", auth, getSubscriptions);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // VERY IMPORTANT for signature validation
  require("../controllers/paymentController").handleWebhook
);


module.exports = router;
