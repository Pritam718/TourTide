const RefreshToken = require("../../models/refreshTokenModel");
const { User } = require("../../models/userModel");
const { verifyPassword } = require("../../helper/passwordHash");
const jwt = require("jsonwebtoken");
const { Tour } = require("../../models/tourModel");
const { Hotel } = require("../../models/hotelModel");
const { Food } = require("../../models/foodModel");

class AdminEjsController {
  async dashboard(req, res) {
    try {
      const tourDetails = await Tour.find({});
      const hotelDetails = await Hotel.find({});
      const foodDetails = await Food.find({});
      const userDetails = await User.find({});

      res.render("adminDashboard", {
        tourDetails,
        hotelDetails,
        foodDetails,
        userDetails,
        user: req.user || null,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async adminProfile(req, res) {
    const userId = req.user ? req.user.userId : "null";
    const user = await User.findById(userId);
    res.render("adminProfile", { user });
  }
  async adminEditForm(req, res) {
    try {
      const userId = req.user ? req.user.userId : "null";
      const user = await User.findById(userId);
      const redirectTo = req.query.redirectTo || "/user/dashboard";

      res.render("adminEditForm", { user, redirectTo });
    } catch (error) {
      console.log(error);
    }
  }
  async adminEdit(req, res) {
    try {
      const id = req.params.id;
      console.log(id);
      const existingUser = await User.findById(id);
      if (!existingUser) {
        console.log("User not found");
      }

      const {
        name,
        email,
        phone,
        country,
        street,
        houseNumber,
        apartment,
        city,
        state,
        postcode,
        redirectTo,
      } = req.body;
      const updateData = await User.findByIdAndUpdate(
        id,
        {
          name,
          email,
          phone,
          country,
          street,
          houseNumber,
          apartment,
          city,
          state,
          postcode,
        },
        { new: true }
      );
      req.flash("success_msg", "User Profile Update");
      return res.redirect("/admin/adminProfile/");
    } catch (error) {
      console.log(error);
    }
  }
  async tourTable(req, res) {
    try {
      const tourData = await Tour.find();
      res.render("tourTable", {
        tours: tourData,
        user: req.user || null,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async hotelTable(req, res) {
    try {
      const hotelData = await Hotel.find();
      res.render("hotelTable", {
        hotels: hotelData,
        user: req.user || null,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async foodTable(req, res) {
    try {
      const data = await Food.aggregate([
        {
          $lookup: {
            from: "tours",
            localField: "tour",
            foreignField: "_id",
            as: "tour",
          },
        },
      ]);
      console.log(data);
      res.render("foodTable", { foods: data, user: req.user || null });
    } catch (error) {
      console.log(error);
    }
  }

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
          email: existingUser.email,
          role: existingUser.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "14m" }
      );
      const refreshToken = jwt.sign(
        {
          userId: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
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
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await RefreshToken.deleteOne({ token: refreshToken });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      req.flash("success_msg", "Logout successfull");
      res.redirect("/admin/");
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new AdminEjsController();
