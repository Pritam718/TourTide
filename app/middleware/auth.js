const statusCode = require("../helper/httpsStatusCode");
const jwt = require("jsonwebtoken");
const refreshAccessToken = require("../helper/tokenGenerate");

const authenticationToken = async (req, res, next) => {
  try {
    const accessToken =
      req.body?.token ||
      req.query?.token ||
      req.headers["x-access-token"] ||
      req.cookies.accessToken;

    if (!accessToken) {
      res.locals.isAuthenticated = false; // <-- Set for EJS
      return next(); // Still go to page, just unauthenticated
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      res.locals.isAuthenticated = true; // <-- Authenticated
      return next();
    } catch (error) {
      if (error.name !== "TokenExpiredError") {
        res.locals.isAuthenticated = false;
        return next(); // Let frontend know not logged in
      }

      const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        res.locals.isAuthenticated = false;
        return next();
      }

      try {
        const { accessToken: newAccessToken, user } = await refreshAccessToken(
          refreshToken
        );
        res.cookie("accessToken", newAccessToken, { httpOnly: true });
        req.user = user;
        res.locals.isAuthenticated = true;
        return next();
      } catch (refreshError) {
        res.locals.isAuthenticated = false;
        return next();
      }
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.locals.isAuthenticated = false;
    return next(); // Still render page unauthenticated
  }
};

module.exports = authenticationToken;
