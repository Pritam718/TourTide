const statusCode = require("../../helper/httpsStatusCode");
const { hashGenerate, verifyPassword } = require("../../helper/passwordHash");
const refreshAccessToken = require("../../helper/tokenGenerate");
const RefreshToken = require("../../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const { User, userSchemaValidation } = require("../../models/userModel");
const sendEmailVerificationOTP = require("../../helper/smsValidation");
const EmailVerifyModel = require("../../models/otpModel");


class UserController {
  async dashboard(req, res) {
    try {
      res.render("home");
    } catch (error) {
      console.log(error);
    }
  }
  async register(req, res) {
    try {
      const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
      };
      const { error, value } = userSchemaValidation.validate(data);
      if (error) {
        return res.status(statusCode.badRequest).json({
          message: error.details[0].message,
        });
      } else {
        const { name, email, phone, password, role } = req?.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          res.status(statusCode.badRequest).json({
            message: "User Already exist",
          });
        }
        const hashPassword = hashGenerate(password);
        const user = new User({
          name,
          email,
          phone,
          password: hashPassword,
          role,
        });
        const userData = await user.save();

        sendEmailVerificationOTP(req, user);

        return res.status(statusCode.create).json({
          message: "Registration successfully done. Now verify your email",
          data: userData,
        });
      }
    } catch (error) {
      return res.status(statusCode.internalServerError).json({
        message: error,
      });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(statusCode.badRequest)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res
          .status(statusCode.badRequest)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      if (existingUser.is_verified) {
        return res
          .status(statusCode.badRequest)
          .json({ status: false, message: "Email is already verified" });
      }

      const emailVerification = await EmailVerifyModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          await sendEmailVerificationOTP(req, existingUser);
          return res.status(statusCode.badRequest).json({
            status: false,
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res
          .status(statusCode.badRequest)
          .json({ status: false, message: "Invalid OTP" });
      }

      const currentTime = new Date();

      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        await sendEmailVerificationOTP(req, existingUser);
        return res.status(statusCode.badRequest).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your email",
        });
      }

      existingUser.is_verified = true;
      await existingUser.save();

      await EmailVerifyModel.deleteMany({ userId: existingUser._id });
      return res
        .status(statusCode.success)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(statusCode.internalServerError).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req?.body;
      if (!email || !password) {
        return res.status(statusCode.internalServerError).json({
          message: "All fields are reuired",
        });
      }
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(statusCode.badRequest).json({
          message: "User not found",
        });
      }
      // if (!existingUser.is_verified) {
      //   await sendEmailVerificationOTP(req, existingUser);
      //   return res.status(statusCode.badRequest).json({
      //     message: "User not verified",
      //   });
      // }
      const isMatchingPassword = await verifyPassword(
        password,
        existingUser.password
      );
      if (!isMatchingPassword) {
        return res.status(statusCode.badRequest).json({
          message: "Invalid credentials",
        });
      }

      const accessToken = jwt.sign(
        { userId: existingUser._id, name: existingUser.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      const refreshToken = jwt.sign(
        { userId: existingUser._id, name: existingUser.name },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1m" }
      );

      const userToken = await RefreshToken.findOne({ user: existingUser._id });
      if (userToken) {
        await RefreshToken.deleteOne({ user: existingUser._id });
      }
      await RefreshToken.create({
        token: refreshToken,
        user: existingUser._id,
      });

      // res.cookie("accessToken", accessToken, { httpOnly: true });
      // res.cookie("refreshToken", refreshToken, { httpOnly: true });

      return res.status(statusCode.success).json({
        message: "Login successfull",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async createNewToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
      const { accessToken } =await refreshAccessToken(refreshToken);

      res.cookie("accessToken", accessToken, { httpOnly: true });
      return res.status(200).json({ accessToken: accessToken });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new UserController();
