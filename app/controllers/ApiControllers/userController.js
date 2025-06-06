const statusCode = require("../../helper/httpsStatusCode");
const { hashGenerate, verifyPassword } = require("../../helper/passwordHash");
const refreshAccessToken = require("../../helper/tokenGenerate");
const RefreshToken = require("../../models/refreshTokenModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");

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
      const { name, email, phone, password, role } = req?.body;
      if (!name || !email || !phone || !password) {
        return res.status(statusCode.internalServerError).json({
          message: "All fields are required",
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
      return res.status(statusCode.create).json({
        message: "Registration successfully done",
        data: userData,
      });
    } catch (error) {
      return res.status(statusCode.internalServerError).json({
        message: error,
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
