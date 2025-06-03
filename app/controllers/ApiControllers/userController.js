const statusCode = require("../../helper/httpsStatusCode");
const { hashGenerate, verifyPassword } = require("../../helper/passwordHash");
const { User, userSchemaValidation } = require("../../models/userModel");

class UserController {
  async register(req, res) {

    try {
      const data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password
      }
      const{error,value}=userSchemaValidation.validate(data)
      if(error){
        return res.status(statusCode.badRequest).json({
          message: error.details[0].message
        })
      }

      const { name, email, phone, password, role } = req?.body;
      
      /*
      if (!name || !email || !phone || !password) {
        return res.status(statusCode.internalServerError).json({
          message: "All fields are required",
        });
      }
      */
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
