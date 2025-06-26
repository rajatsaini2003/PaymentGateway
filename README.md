# 💳 Payment Gateway System

A full-stack secure payment gateway system built using Node.js, Express, MongoDB, and Next.js. The system integrates Razorpay for both one-time payments and subscriptions, and offers a fully functional frontend dashboard for managing transactions, subscriptions, and notifications.

## 🚀 Features

### 🧑‍💻 Authentication

- JWT-based login and registration

- Secure cookie storage

### 💳 Payments

- One-time payment creation and verification

- Signature validation and transaction logging

### 🔁 Subscriptions

- Create, cancel, and sync Razorpay subscriptions

- Dashboard UI for viewing active and cancelled plans

- Notifications for failed or pending payments

### 📊 Transactions

- View all transactions by user

- PDF invoice support (coming soon)

### 🔔 Notifications

- Alerts for upcoming renewals, overdue payments, and errors

## 🧰 Tech Stack

| Layer          | Technologies Used               |
| -------------- | ------------------------------- |
| Frontend       | Next.js 14, TypeScript, Tailwind CSS |
| Backend        | Node.js, Express.js             |
| Authentication | JWT, bcrypt                     |
| Database       | MongoDB, Mongoose               |
| Payments       | Razorpay                        |
| Security       | Helmet, CORS, Rate Limiting     |


## 🔧 Setup Instructions

1. Clone the Repository

``` git clone https://github.com/rajatsaini2003/PaymentGateway.git
cd payment-gateway 
```

2. Install Dependencies

```
 npm install
```

3. Configure Environment Variables

- Create a .env file:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/payment_gateway
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
4. Start Backend
```
npm run dev
```
5. Start Frontend
```
cd client
npm install
npm run dev
```
## 📡 API Endpoints

### 🔐 Auth

- POST `/api/auth/register` – Register user

- POST `/api/auth/login` – Login user and receive JWT

### 💳 Payment

- POST `/api/payment/create-order` – Create Razorpay order

- POST `/api/payment/verify` – Verify one-time payment

- GET `/api/payment/transactions` – User transactions

### 🔁 Subscription

- POST `/api/payment/subscribe` – Create subscription

- POST `/api/payment/verify-subscription` – Verify subscription payment

- GET `/api/payment/subscriptions `– Get all subscriptions

- POST` /api/payment/subscription/cancel` – Cancel subscription

### 📣 Subscription Enhancements

- GET `/api/payment/subscriptions/notifications` – Get subscription alerts

- POST `/api/payment/subscriptions/sync/:subscriptionId `– Sync status

- GET `/api/payment/subscriptions/:subscriptionId `– Get subscription info

- POST` /api/payment/subscriptions/:subscriptionId/update` – Update subscription

- GET `/api/payment/subscriptions/:subscriptionId/payments `– Subscription invoices

### 🕸 Webhooks

- POST `/api/payment/webhook/subscription` – Razorpay webhook handler

## 🛠️ Utility Scripts

- Razorpay Signature Generator (Manual Testing)

- utils/generateSignature.js

- utils/generateSubscriptionSignature.js

`Use these to simulate payment verification in Postman.`

## 📁 Project Structure

```
project-root/
├── client/                   # Frontend (Next.js)
│   ├── components/           # Reusable UI components
│   ├── pages/                # Next.js pages
│   ├── hooks/                # Custom React hooks (e.g., useAuth)
│   ├── lib/                  # API clients, helpers, types
│   └── public/               # Static assets
│
├── server/                   # Backend (Express.js)
│   ├── controllers/          # Route handler logic
│   ├── routes/               # Express route definitions
│   ├── models/               # Mongoose schemas
│   ├── middleware/           # Auth & error middleware
│   ├── utils/                # Helpers (signature gen, etc.)
│   └── config/               # DB and Razorpay setup
│
├── .env                      # Environment variables
├── package.json              # Project metadata and dependencies
└── README.md                 # Project documentation
```

## 🛡️ Security

- JWT-secured APIs

- Helmet, CORS, and rate-limiting

- HTTPS ready for production

- .env excluded from version control



## 📄 License

MIT License

## 👨‍💻 Author

Rajat Saini GitHub: @rajatsaini2003

## 🤝 Contributions

Pull requests and suggestions are welcome!

