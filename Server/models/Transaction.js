const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    amount:{
        type:Number,
        required:true,
    },
    currency:{
        type:String,
        default:'INR'
    },
    paymentId:{
        type:String,
        unique:true
    },
    status:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("Transaction",TransactionSchema)