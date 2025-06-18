# 💳 Payment Gateway System

A secure, server-side payment gateway system built using Node.js, Express, and MongoDB. This project handles user authentication, integrates with real payment processors like Stripe, logs transactions, and supports subscription management and fraud detection.

---

## 🚀 Features

- 🔐 User authentication using JWT
- 💳 Payment processing via Stripe (can be extended to PayPal, Razorpay, etc.)
- 📊 Transaction logging and reporting
- 🔁 Subscription handling
- 🛡️ Fraud detection measures
- 📄 RESTful API design

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT, bcrypt
- **Payment Gateway:** Stripe
- **Security Tools:** Helmet, CORS, Rate Limiting

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rajatsaini2003/PaymentGateway.git
cd payment-gateway
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a .env file in the root with the following content:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/payment_gateway
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
```
### 4. Start the Server
```bash

npm run dev
```
## 📡 API Endpoints
Authentication
POST /api/auth/register – Register a new user

POST /api/auth/login – Login user and get JWT

Payment (Example placeholder for Stripe)
POST /api/payment/charge – Process payment

GET /api/payment/transactions – View all transactions

## 🛡️ Security Practices
Keep .env out of version control

Use HTTPS in production

Sanitize all incoming data

Securely store secrets (e.g. with AWS Secrets Manager)

## 🔐 `generateSignature.js` — Razorpay Signature Generator (For Manual Testing)

This utility script helps manually generate a valid Razorpay signature for testing payment verification in Postman or backend, without using the Razorpay Checkout frontend.

---

### 📌 Why Use This?

When testing payments without a frontend, you won't receive a real `razorpay_signature`. This script generates a mock signature using the same logic Razorpay uses, so you can test your `/api/payment/verify` API route properly.

---

### 🛠️ How to Use

1. **Ensure the script exists at:**  
utils/generateSignature.js




2. **Set your secret in .env (in project root):**

```
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
```
3. **Run the script from the project root:**
```
node utils/generateSignature.js
```
4.  **Use the output signature in your Postman request to : ***/api/payment/verify:*****

```
{
  "razorpay_order_id": "order_id_from_create_order",
  "razorpay_payment_id": "pay_XXXXXXX",
  "razorpay_signature": "OUTPUT_FROM_SCRIPT",
  "amount": 500
}
```
5. **Example Output**
```
Generated Razorpay Signature: 123456abcdef7890abcd123456abcdef7890abcd123456abcdef7890abcd1234
```

## 🧭 Roadmap / Future Enhancements
Integrate Razorpay and PayPal

Build a frontend dashboard (React/Next.js)

Add Nodemailer for email receipts

Implement webhook support

Add admin panel for transaction management

## 📄 License
This project is licensed under the MIT License.

## 👨‍💻 Author
Rajat Saini

GitHub: github.com/rajatsaini2003


## 🤝 Contributions
Feel free to fork, submit pull requests, and contribute ideas!










