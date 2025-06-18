const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
                expiresIn: "24h"
            } )
            existingUser.toObject();
            existingUser.token = token;
            existingUser.password = undefined;
            existingUser.tokenExpiresAt =  new Date(Date.now() +  24 * 60 * 60 * 1000)
            //console.log(existingUser)
            const options = {
                expires: new Date(Date.now() +  24 * 60 * 60 * 1000), // Same as token expiry
                httpOnly: true,
                secure: true, // Enable in production with HTTPS
                sameSite: "Strict",
            };

            return res.cookie("token", token, options).status(200).json({
                success:true,
                message:'Login successfull',
                token, 
                existingUser
            })
  } catch (err) {
    res.status(500).send("Server error");
  }
};
