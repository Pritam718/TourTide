const statusCode = require("../../helper/httpsStatusCode");
const { hashGenerate, verifyPassword } = require("../../helper/passwordHash");
const RefreshToken = require("../../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const { User, userSchemaValidation } = require("../../models/userModel");
const sendEmailVerificationOTP = require("../../helper/smsValidation");
const EmailVerifyModel = require("../../models/otpModel");

class UserEjsController {
  async signupPage(req, res) {
    try {
      res.render("signup");
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
        req.flash("error_msg", error.details[0].message);
        return res.redirect("/signup");
      } else {
        const { name, email, phone, password, role } = req?.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          req.flash("error_msg", "User Already Exist");
          return res.redirect("/signin");
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

        req.flash(
          "success_msg",
          "Registration successfully done. Now verify your email with otp.Please check your email"
        );
        return res.redirect("/verifyOtp");
      }
    } catch (error) {
      req.flash("error_msg", "Registration Failed");
      res.redirect("/signup");
    }
  }
  async otpPage(req, res) {
    try {
      res.render("otpPage");
    } catch (error) {
      console.log(error);
    }
  }
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        req.flash("error_msg", "All fields are required");
        return res.redirect("/verifyOtp");
      }
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        req.flash("error_msg", "Email doesn't exists");
        return res.redirect("/verifyOtp");
      }

      if (existingUser.is_verified) {
        req.flash("error_msg", "Email is already verified");
        return res.redirect("/signin");
      }

      const emailVerification = await EmailVerifyModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          await sendEmailVerificationOTP(req, existingUser);
          req.flash("error_msg", "Invalid OTP, new OTP sent to your email");
          return res.redirect("/verifyOtp");
        }
        req.flash("error_msg", "Invalid OTP, new OTP sent to your email");
        return res.redirect("/verifyOtp");
      }

      const currentTime = new Date();

      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        await sendEmailVerificationOTP(req, existingUser);
        req.flash("error_msg", "Invalid OTP, new OTP sent to your email");
        return res.redirect("/verifyOtp");
        // return res.status(statusCode.badRequest).json({
        //   status: "failed",
        //   message: "OTP expired, new OTP sent to your email",
        // });
      }

      existingUser.is_verified = true;
      await existingUser.save();

      await EmailVerifyModel.deleteMany({ userId: existingUser._id });
      req.flash("success_msg", "Email verified successfully");
      return res.redirect("/signin");
      // return res
      //   .status(statusCode.success)
      //   .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(statusCode.internalServerError).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }
  async signinPage(req, res) {
    try {
      res.render("signin");
    } catch (error) {
      console.log(error);
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req?.body;
      if (!email || !password) {
        req.flash("error_msg", "All fields are reuired");
        return res.redirect("/signin");
        // return res.status(statusCode.internalServerError).json({
        //   message: "All fields are reuired",
        // });
      }
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        req.flash("error_msg", "User not found");
        return res.redirect("/signin");
        // return res.status(statusCode.badRequest).json({
        //   message: "User not found",
        // });
      }
      if (!existingUser.is_verified) {
        await sendEmailVerificationOTP(req, existingUser);
        req.flash("error_msg", "User not verified");
        return res.redirect("/verifyOtp");
        // return res.status(statusCode.badRequest).json({
        //   message: "User not verified",
        // });
      }
      const isMatchingPassword = await verifyPassword(
        password,
        existingUser.password
      );
      if (!isMatchingPassword) {
        req.flash("error_msg", "Invalid credentials");
        return res.render("/signin");
        // return res.status(statusCode.badRequest).json({
        //   message: "Invalid credentials",
        // });
      }

      const accessToken = jwt.sign(
        {
          userId: existingUser._id,
          name: existingUser.name,
          role: existingUser.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "14m" }
      );
      const refreshToken = jwt.sign(
        {
          userId: existingUser._id,
          name: existingUser.name,
          role: existingUser.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      const userToken = await RefreshToken.findOne({ user: existingUser._id });
      if (userToken) {
        await RefreshToken.deleteOne({ user: existingUser._id });
      }
      await RefreshToken.create({
        token: refreshToken,
        user: existingUser._id,
      });

      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });

      req.flash("success_msg", "Login successfull");
      res.redirect("/");
      //   return res.status(statusCode.success).json({
      //     message: "Login successfull",
      //     accessToken: accessToken,
      //     refreshToken: refreshToken,
      //   });
    } catch (error) {
      console.log(error);
    }
  }
  async forgotPasswordEmailForm(req, res) {
    try {
      res.render("forgotWithEmail");
    } catch (error) {
      console.log(error);
    }
  }
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash("error_msg", "Email is required");
        return res.redirect("/forgot-password");
        // res
        //   .status(statusCode.badRequest)
        //   .json({ message: "Email is required" });
      }
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("error_msg", "User not found");
        return res.redirect("/forgot-password");
        // res.status(statusCode.badRequest).json({ message: "User not found" });
      }
      sendEmailVerificationOTP(req, user);
      res.redirect("/reset-password");
    } catch (error) {
      console.log(error);
    }
  }
  async confirmPasswordForm(req, res) {
    try {
      res.render("resetPassword");
    } catch (error) {
      console.log(error);
    }
  }
  async confirmPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;
      if (!email || !otp || !newPassword || !confirmPassword) {
        req.flash("error_msg", "All fields are required");
        return res.redirect("/reset-password");
      }
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("error_msg", "User not found");
        return res.redirect("/reset-password");
      }
      if (confirmPassword !== newPassword) {
        req.flash(
          "error_msg",
          "New Password and confirm Password does not match"
        );
        return res.redirect("/forgot-password");
      }
      const otpverify = await EmailVerifyModel.findOne({
        userId: user._id,
        otp,
      });
      if (!otpverify) {
        await sendEmailVerificationOTP(req, user);
        req.flash("error_msg", "Invalid Otp");
        return res.redirect("/forgot-password");
      }
      const currentTime = new Date();
      const expirationTime = new Date(
        otpverify.createdAt.getTime() + 15 * 60 * 1000
      );
      if (currentTime > expirationTime) {
        await sendEmailVerificationOTP(req, user);
        req.flash("error_msg", "Otp expired, new otp sent to your email");
        return res.redirect("/forgot-password");
      }
      await EmailVerifyModel.deleteMany({ userId: user._id });
      const newHashPassword = hashGenerate(confirmPassword);
      await User.findByIdAndUpdate(user._id, {
        $set: { password: newHashPassword },
      });
      res.redirect("/signin");
    } catch (error) {
      console.log(error);
    }
  }
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await RefreshToken.deleteOne({ token: refreshToken });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      req.flash("success_msg", "Logout successfull");
      res.redirect("/signin");
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new UserEjsController();
