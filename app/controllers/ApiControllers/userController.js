const statusCode = require("../../helper/httpsStatusCode");
const { hashGenerate, verifyPassword } = require("../../helper/passwordHash");
const { User, userSchemaValidation } = require("../../models/userModel");
const sendEmailVerificationOTP = require("../../helper/smsValidation");
const EmailVerifyModel = require("../../models/otpModel");

class UserController {
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
        res.status(statusCode.internalServerError).json({
          message: "All fields are reuired",
        });
      }
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        res.status(statusCode.badRequest).json({
          message: "User not found",
        });
      }
      const isVerify = await verifyPassword(password, existingUser.password);
      if (!isVerify) {
        res.status(statusCode.badRequest).json({
          message: "Invalid credentials",
        });
      }
      return res
        .status(statusCode.success)
        .json({ message: "Login successfull" });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new UserController();
