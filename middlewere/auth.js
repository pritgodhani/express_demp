const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel/userModel");
// Required Config
const JWT_SECRET = process.env.JWT_SECRET_KEY;

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-token");
  // console.log("Auth!",req.header("x-auth-token"));
  // Check for token
  if (!token) {
    return res.status(404).json({ success: false, message: "token not found" });
  }

  try {
    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("auth-err.message",err.message);
        return res.status(400).json({ success: false, message: err.message});
      }
      if (!decoded) {
        return res.status(400).json({ success: false, message: err.message,});
      }

      // console.log("auth-decoded",decoded);
      const userdata = await userModel.findOne({ _id: decoded._id });
      // console.log("auth-decoded",userdata);
      if(!userdata)  return res.status(401).json({ success: false, message: "user not found" });
      req.user =decoded
      next();
  
     
    });

    // Add user from payload
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, message: "invalid token"});
  }
};
