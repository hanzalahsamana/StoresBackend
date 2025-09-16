const { UserModal } = require('../Models/userModal');
const { generateOtp } = require('../Utils/Otp');
const { generateHash, compareHash } = require('../Utils/BCrypt');
const { generateJwtToken } = require('../Utils/Jwt');
const { OTPVerificationEmail } = require('../Helpers/EmailsToSend');
const { deleteAllData } = require('../Helpers/deleteAllData');
const { StoreModal } = require('../Models/StoreModal');

module.exports = {
  registerUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      let user = await UserModal.findOne({ email });

      if (user) {
        if (user.verified) {
          return res.status(400).json({ message: 'User already exists.' });
        } else {
          return res.status(200).json({
            message: 'User exists but not verified. Please verify via OTP.',
            email,
          });
        }
      }

      const hashedPassword = await generateHash(password, 10);
      const newUser = new UserModal({
        email,
        password: hashedPassword,
      });

      await newUser.save();

      res.status(201).json({
        message: 'User registered successfully. Please verify via OTP.',
        email,
      });
    } catch (error) {
      console.error('Registration Error:', error);
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: messages[0] }); // return the first validation error
      }

      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  sendOtp: async (req, res) => {
    const { email } = req.body;
    try {
      if (!email) {
        return res.status(404).json({
          message: 'Email is required',
          errorCode: 'InvalidEmail',
        });
      }
      const user = await UserModal.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: 'User not found. Please register first.',
          errorCode: 'UserNotFound',
        });
      }

      if (user.verified) {
        return res.status(400).json({
          message: 'User is already verified.',
          errorCode: 'AlreadyVerified',
        });
      }

      const now = Date.now();
      const COOLDOWN_PERIOD = 2 * 60 * 1000; // 60 seconds (1 minute)
      const OTP_EXPIRATION_TIME = now + 2 * 60 * 1000; // 2 minutes expiration

      if (user.lastOtpSentAt && now - user.lastOtpSentAt < COOLDOWN_PERIOD) {
        return res.status(400).json({
          message: `Please wait ${Math.ceil((COOLDOWN_PERIOD - (now - user.lastOtpSentAt)) / 1000)} seconds before requesting a new OTP.`,
          errorCode: 'OtpCooldown',
          remainingTime: Math.ceil((COOLDOWN_PERIOD - (now - user.lastOtpSentAt)) / 1000),
        });
      }

      const otp = generateOtp();
      user.otp = await generateHash(otp);
      user.otpExpiration = OTP_EXPIRATION_TIME;
      user.lastOtpSentAt = now;

      await user.save();
      await OTPVerificationEmail(user, otp);

      console.log(`OTP sent to ${email}: ${otp}`); // For debugging purposes, remove in production

      return res.status(200).json({
        message: 'OTP sent successfully to your email!',
        remainingTime: COOLDOWN_PERIOD / 1000,
      });
    } catch (error) {
      console.error('OTP Sending Error:', error);
      return res.status(500).json({
        message: 'Internal server error.',
        errorCode: 'ServerError',
      });
    }
  },

  verifyOtp: async (req, res) => {
    const { email, otp } = req.body;

    try {
      if (!email || !otp) {
        return res.status(404).json({ message: 'Email and OTP is required' });
      }
      const user = await UserModal.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (user.verified) {
        return res.status(400).json({ message: 'Email is already verified.' });
      }

      if (new Date() > user.otpExpiration) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.',
          errorCode: 'OTP_EXPIRED',
        });
      }

      const isOtpValid = await compareHash(otp.toString(), user.otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      user.verified = true;
      user.otp = undefined;
      user.otpExpiration = undefined;
      user.lastOtpSentAt = undefined;

      const savedUser = await user.save();
      savedUser.password = undefined;

      const token = await generateJwtToken({ _id: savedUser._id });

      return res.status(200).json({
        token,
        user: savedUser,
        message: 'Email verified successfully!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: error.message || 'Internal Server Error',
      });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModal.findOne({ email });

      if (!user || !user.verified || user.method !== 'email') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await compareHash(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = await generateJwtToken({ _id: user._id });
      user.password = undefined;
      return res.status(200).json({ token, user, message: 'Login successfully!' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserFromToken: async (req, res) => {
    try {
      const userId = req.query.userId;

      const user = await UserModal.findById(userId).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  authWithGoogle: async (req, res) => {
    const { googleToken: accessToken } = req.body;

    console.log('Google Token:', accessToken);

    try {
      if (!accessToken) {
        return res.status(400).json({ message: 'Google access token required' });
      }

      // Call Google userinfo endpoint with access token to get user profile
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return res.status(401).json({ message: 'Invalid Google access token' });
      }

      const payload = await response.json();

      const email = payload.email;
      if (!email) {
        return res.status(400).json({ message: 'Unable to retrieve user from Google' });
      }

      // Find user by email
      let user = await UserModal.findOne({ email });

      if (user) {
        if (user.method === 'google') {
          const token = await generateJwtToken({ _id: user._id });

          const userObj = user.toObject();
          delete userObj.password;

          return res.status(200).json({
            token,
            user: userObj,
            message: 'Login successful via Google!',
          });
        } else {
          return res.status(400).json({
            message: 'User already exists with a different login method.',
            errorCode: 'UserExistsWithDifferentMethod',
          });
        }
      }

      // New user - register
      const newUser = new UserModal({
        email,
        password: 'google-user', // default password, you may keep empty or random
        verified: true,
        method: 'google',
      });

      const savedUser = await newUser.save();
      savedUser.password = undefined;

      const token = await generateJwtToken({ _id: savedUser._id });
      console.log(token, savedUser?._id);

      // const storeDetail = new StoreDetailModal({
      //   brand_Id: savedUser.brand_Id,
      //   brandName: savedUser.brandName,
      // });
      // await storeDetail.save();

      // await SeedDefaultData(savedUser.brandName);

      return res.status(200).json({
        token,
        user: savedUser,
        message: 'Registered successfully!',
      });
    } catch (error) {
      console.error('Google Auth Error:', error);
      res.status(500).json({ message: 'Google authentication failed.' });
    }
  },

  editPassword: async (req, res) => {
    try {
      const { userId } = req.query;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'Invalid token', success: false });
      }

      const user = await UserModal.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
      }

      const isMatch = await compareHash(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect', success: false });
      }

      const hashedPassword = await generateHash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: 'Password updated successfully', success: true });
    } catch (e) {
      console.log('Error editing password', e?.message || e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.query.userId;

      if (!password) {
        return res.status(400).json({ message: 'Password is required', success: false });
      }

      const user = await UserModal.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'Invalid userId', success: false });
      }

      const isPasswordValid = await compareHash(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password', success: false });
      }

      const stores = await StoreModal.find({ userRef: userId });
      const storeIds = stores.map((store) => store._id);

      if (storeIds.length > 0) {
        await deleteAllData(storeIds);
        await StoreModal.deleteMany({ userRef: userId });
      }

      await UserModal.findByIdAndDelete(userId);

      return res.status(200).json({ message: 'Account and all related data deleted', success: true });
    } catch (e) {
      console.error('Error deleting account', e?.message || e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },
};
