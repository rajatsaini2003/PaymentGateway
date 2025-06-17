const express = require('express')
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require("./config/db");
//const auth = require('./routes/auth')
dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

//app.use("/api/auth",auth)

const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log("Server running at port: ",port)
})