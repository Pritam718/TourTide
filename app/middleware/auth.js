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
      return res
        .status(statusCode.unauthorized)
        .json({ message: "Access Denied: No Token" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      if (error.name !== "TokenExpiredError") {
        return res
          .status(statusCode.forbidden)
          .json({ message: "Invalid token" });
      }

      const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
      const { accessToken, user } = await refreshAccessToken(refreshToken);
      res.cookie("accessToken", accessToken, { httpOnly: true });
      req.user = user;
      return next();
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Authentication failed" });
  }
};

module.exports = authenticationToken;
