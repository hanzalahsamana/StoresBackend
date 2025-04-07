const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const { UserModal } = require("../Models/userModal");
const SeedDefaultData = require("../InitialSeeding/SeedDefaultData");
const { generateOtp } = require("../Utils/Otp");
const { generateHash, compareHash } = require("../Utils/BCrypt");
const { userRegisterValidate } = require("../Utils/userValidate");
const { OTPVerificationEmail } = require("../Utils/EmailsToSend");
const { generateJwtToken } = require("../Utils/Jwt");

app.use(express.json());

module.exports = {
  registerUser: async (req, res) => {
    const { email, brandName, password, subDomain } = req.body;

    try {
      let user = await UserModal.findOne({ email });

      if (user) {
        if (user.verified) {
          return res.status(400).json({ message: "User already exists." });
        } else {
          return res.status(200).json({
            message: "User exists but not verified. Please verify via OTP.",
            email,
          });
        }
      }

      const hashedPassword = await generateHash(password, 10);
      const newUser = new UserModal({
        email,
        password: hashedPassword,
        brandName,
        subDomain,
      });

      await newUser.save();

      res.status(201).json({
        message: "User registered successfully. Please verify via OTP.",
        email,
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  sendOtp: async (req, res) => {
    const { email } = req.body;
    try {
      if (!email) {
        return res.status(404).json({
          message: "Email is required",
          errorCode: "InvalidEmail",
        });
      }
      const user = await UserModal.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: "User not found. Please register first.",
          errorCode: "UserNotFound",
        });
      }

      if (user.verified) {
        return res.status(400).json({
          message: "User is already verified.",
          errorCode: "AlreadyVerified",
        });
      }

      const now = Date.now();
      const COOLDOWN_PERIOD = 2 * 60 * 1000; // 60 seconds (1 minute)
      const OTP_EXPIRATION_TIME = now + 2 * 60 * 1000; // 2 minutes expiration

      if (user.lastOtpSentAt && now - user.lastOtpSentAt < COOLDOWN_PERIOD) {
        return res.status(400).json({
          message: `Please wait ${Math.ceil(
            (COOLDOWN_PERIOD - (now - user.lastOtpSentAt)) / 1000
          )} seconds before requesting a new OTP.`,
          errorCode: "OtpCooldown",
          remainingTime: Math.ceil(
            (COOLDOWN_PERIOD - (now - user.lastOtpSentAt)) / 1000
          ),
        });
      }

      const otp = generateOtp();
      console.log(otp);

      user.otp = await generateHash(otp);
      user.otpExpiration = OTP_EXPIRATION_TIME;
      user.lastOtpSentAt = now;

      await user.save();
      await OTPVerificationEmail(user, otp);

      return res.status(200).json({
        message: "OTP sent successfully to your email!",
        remainingTime: COOLDOWN_PERIOD / 1000,
      });
    } catch (error) {
      console.error("OTP Sending Error:", error);
      return res.status(500).json({
        message: "Internal server error.",
        errorCode: "ServerError",
      });
    }
  },

  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;

    try {
      if (!email || !otp) {
        return res.status(404).json({ message: "Email and OTP is required" });
      }
      const user = await UserModal.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.verified) {
        return res.status(400).json({ message: "Email is already verified." });
      }

      if (new Date() > user.otpExpiration) {
        return res.status(400).json({
          message: "OTP has expired. Please request a new one.",
          errorCode: "OTP_EXPIRED",
        });
      }

      const isOtpValid = await compareHash(otp.toString(), user.otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      user.verified = true;
      user.otp = undefined;
      user.otpExpiration = undefined;
      user.lastOtpSentAt = undefined;

      const savedUser = await user.save();
      savedUser.password = undefined;

      const token = generateJwtToken({ _id: savedUser._id });

      await SeedDefaultData(user.brandName);

      return res.status(200).json({
        token,
        user: savedUser,
        message: "Email verified successfully!",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  },

  
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModal.findOne({ email });

      if (!user || !user.verified) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await compareHash(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = await generateJwtToken({ _id: user._id });
      user.password = undefined;
      return res
        .status(200)
        .json({ token, user, message: "Login successfully!" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserFromToken: async (req, res) => {
    try {
      const userId = req.query.userId;

      const user = await UserModal.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
