const express = require("express");
const app = express();
app.use(express.json());
const SeedDefaultData = require("../InitialSeeding/SeedDefaultData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModal } = require("../Models/userModal");
const { generateOtp } = require("../Utils/Otp");
const { generateHash, compareHash } = require("../Utils/BCrypt");
const { OTPVerification } = require("../Utils/EmailsToSend");
const { userRegisterValidate } = require("../Utils/userValidate");

module.exports = {
  sendOtp: async (req, res) => {
    const { email, brandName, name, password, isResend } = req.body;

    try {
      const otp = generateOtp();
      const hashedOtp = await generateHash(otp);
      const otpExpiration = new Date(2 * 60 * 1000 + Date.now());
      const COOLDOWN_PERIOD = 120 * 1000;

      let user = await UserModal.findOne({ email });

      if (user) {
        if (user.verified) {
          return res.status(400).json({ message: "User is already exist." });
        }

        if (isResend) {
          const now = new Date();

          if (user.otpExpiration && now < user.otpExpiration) {
            return res.status(400).json({
              message:
                "An OTP is already sended. Please wait for it to expire.",
            });
          }

          if (
            user.lastOtpSentAt &&
            now - user.lastOtpSentAt < COOLDOWN_PERIOD
          ) {
            const remainingTime = Math.ceil(
              (COOLDOWN_PERIOD - (now - user.lastOtpSentAt)) / 1000
            );
            return res.status(400).json({
              message: `Please wait ${remainingTime} seconds before requesting a new OTP.`,
            });
          }
        } else {
          if (!password) {
            return res.status(400).json({
              message: "Password is required.",
            });
          }

          user.password = await generateHash(password, 10);
        }

        user.otp = hashedOtp;
        user.otpExpiration = otpExpiration;
        user.lastOtpSentAt = new Date();
      } else {
        const validationResponse = userRegisterValidate(req, res);
        if (validationResponse) return validationResponse;

        user = new UserModal({
          email,
          password: await generateHash(password, 10),
          name,
          brandName,
          otp: hashedOtp,
          otpExpiration,
          lastOtpSentAt: new Date(),
        });
      }
      const savedUser = await user.save();
      await OTPVerification(savedUser, otp);
      res.status(200).json({ message: "OTP sent successfully to your email!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;

    try {
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

      const isOtpValid = await compareHash(otp, user.otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP." });
      }

      user.verified = true;
      user.otp = undefined;
      user.otpExpiration = undefined;
      user.lastOtpSentAt = undefined;
      await user.save();
      await SeedDefaultData(user.brandName);
      res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModal.findOne({ email });
      if (!user) return res.status(401).json({ message: "User not found" });

      if (!user.verified) {
        return res.status(401).json({ message: "email is not verified" });
      }

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
