const RefreshToken = require("../../models/refreshTokenModel");
const { User } = require("../../models/userModel");
const { verifyPassword } = require("../../helper/passwordHash");
const jwt = require("jsonwebtoken");

class AdminEjsController {
  async login(req, res) {
    try {
      const { email, password } = req?.body;
      if (!email || !password) {
        req.flash("error_msg", "All fields are reuired");
        return res.redirect("/admin/login");
      }
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        req.flash("error_msg", "User not found");
        return res.redirect("/admin/login");
      }

      const isMatchingPassword = await verifyPassword(
        password,
        existingUser.password
      );
      if (!isMatchingPassword) {
        req.flash("error_msg", "Invalid credentials");
        return res.render("/admin/login");
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
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new AdminEjsController();
