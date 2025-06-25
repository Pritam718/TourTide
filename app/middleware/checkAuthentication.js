const { validateAccessToken } = require("../helper/tokenGenerate");

const checkAuthentication = async (req, res, next) => {
  try {
    if (req.user) {
      req.isAuthenticated = true;
      return next();
    } else {
      const accessToken = req.cookies.accessToken;
      if (accessToken) {
        const user = await validateAccessToken(
          process.env.ACCESS_TOKEN_SECRET,
          accessToken
        );
        if (user) {
          req.user = user;
          req.isAuthenticated = true;
          return next();
        }
      }
      req.isAuthenticated = false;
      return next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = checkAuthentication;
