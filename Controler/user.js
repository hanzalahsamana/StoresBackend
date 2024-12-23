const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const Joi = require("joi");
const { UserModal } = require("../Models/userModal");

module.exports = {
  // register user function
  registerUser: async (req, res) => {
    const userExists = await UserModal.find({ email: req.body.email });
    console.log(userExists);
    if (userExists.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const userModal = new UserModal(req.body);
    userModal.password = await bcrypt.hash(req.body.password, 10);
    try {
      const savedUser = await userModal.save();
      savedUser.password = undefined;
      return res.status(201).json(savedUser);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // login user function
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const user = await UserModal.findOne({ email });
      if (!user) return res.status(401).json({ message: "User not found" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email/password" });
      }

      const userToken = {
        _id: user._id,
        brandName: user.brandName,
        email: user.email,
        name: user.name,
        brand_Id: user.brand_Id,
      };

      const secret = process.env.SECRET;

      const jwtToken = jwt.sign(userToken, secret, { expiresIn: "2d" });

      return res.status(200).json({ jwtToken, userToken });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};