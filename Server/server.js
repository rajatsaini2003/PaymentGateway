const express = require('express')
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require("./config/db");
const auth = require('./routes/auth');
const payment = require('./routes/payment')
const { handleWebhook } = require("./controllers/paymentController");
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), handleWebhook);
app.use(express.json());

app.use("/api/auth",auth)
app.use('/api/payment',payment)


const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log("Server running at port: ",port)
})