const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type:String,
        required: true,
    },
    role:{
        type:String,
        default:'user'
    },
    token: {
        type: String,
    },
    tokenExpiresAt:{
        type:Date,
        default: new Date(Date.now()+24*60*60*1000)
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    }],
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    }]

})

module.exports = mongoose.model("User", UserSchema);