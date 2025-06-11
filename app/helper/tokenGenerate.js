const jwt = require("jsonwebtoken");
const statusCode = require("./httpsStatusCode");
const RefreshToken = require("../models/refreshTokenModel");

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw { status: 401, message: "Refresh token not provided" };
  }

  try {
    const existingToken = await RefreshToken.findOne({ token: refreshToken });
    if (!existingToken) {
      throw { status: 403, message: "Refresh token not valid" };
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        name: decoded.name,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );
    return { accessToken: newAccessToken, user: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw { status: 403, message: "Refresh token expired" };
    }
    throw { status: 403, message: "Invalid refresh token" };
  }
}

module.exports = refreshAccessToken;
