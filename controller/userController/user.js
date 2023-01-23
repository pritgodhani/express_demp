const userModel = require("../../models/userModel/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
module.exports = {
  createUser: async (req, res) => {
    // console.log("signup", req.body.userName);
    let bUserName = req.body.userName;
    let bEmail = req.body.email;
    let bPassword = req.body.password;
    // validate field
    if (!bUserName) return res.status(404).json("please enter username");
    if (!bEmail) return res.status(404).json("please enter email");
    if (!bPassword) return res.status(404).json("please enter password");
    //unique email enter

    // encript passWord
    try {
      const bcryptPass = await bcrypt.hash(
        bPassword,
        Number(process.env.BCRYPT_KEY)
      );
      console.log("bcryptPass", bcryptPass);
      // createuser
      const createNewUser = new userModel({
        userName: bUserName,
        email: bEmail,
        password: bcryptPass,
      });
      const createdUser = await createNewUser.save();

      if (!createdUser) return res.status(400).json("sign-up unsuccessfully");

      return res.status(200).json("sign-up sucessfuly");
    } catch (error) {
      if (error.keyValue.email)
        return res.status(409).json("email alrady exist");
      return res.status(400).json(error);
    }
  },

  userLogin: async (req, res) => {
    console.log("login");
    let bEmail = req.body.email;
    let bPassword = req.body.password;
    if (!bPassword) return res.status(404).json("please enter password");
    if (!bEmail) return res.status(404).json("please enter email");
    try {
      const Dbuser = await userModel.findOne({ email: bEmail });
      if (!Dbuser) return res.status(404).json("user not found");
      // console.log("Dbuser", Dbuser);
      const pasMatch = await bcrypt.compare(bPassword, Dbuser.password);
      // console.log("pasMatch", pasMatch);
      if (pasMatch == false) return res.status(401).json("invalid password");
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      let data = {
        _id: Dbuser._id,
        time: Date(),
        username: Dbuser.userName,
        email: Dbuser.email,
      };
      var token = jwt.sign(data, jwtSecretKey);
      // console.log("token",token);

      return res
        .status(200)
        .json({ message: "login successfully", token: token });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    }
  },
  forgotPassword: async (req, res) => {
    const userEmail = req.body.email;
    if (!userEmail) return res.status(400).json("please enter email");
    try {
      //check-->unice
      const Dbuser = await userModel.findOne({ email: userEmail });
      if (!Dbuser) return res.status(400).json("email not  exist ");

      console.log("forgotPassword", userEmail);
      // otp generate
      function generateOTP() {
        // Declare a digits variable
        // which stores all digits
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      }
      const OTP = generateOTP();

      // send the email
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "dennis.kling71@ethereal.email",
          pass: "fRHfF6XgCgf6xTGqz3",
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"demo" <demo@example.com>', // sender address
        to: `${userEmail}`, // list of receivers
        subject: "Login verification ✔", // Subject line
        text: `OTP:${OTP}`, // plain text body
      });
      console.log("info", info);
      if (info) {
        const storeOTP = await userModel.findOneAndUpdate(
          { _id: Dbuser._id },
          { otp: OTP },
          { new: true }
        );
        if (storeOTP) return res.status(200).json("please check your email!!!");
      }
      console.log("forgotPassword", OTP);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ mesaage: error });
    }
  },
  verifyPassword: async (req, res) => {
    let bOtp = req.body.otp;
    let bEmail = req.body.email;
    let bPassword = req.body.password;
    if (!bOtp) return res.status(404).json("please enter password");
    if (!bPassword) return res.status(404).json("please enter password");
    if (!bEmail) return res.status(404).json("please enter email");
    // console.log("verifyPassword", req.body);
    try {
      const Dbuser = await userModel.findOne({ email: bEmail });
      if (!Dbuser) return res.status(400).json("email not  exist ");
      // console.log("DBotp====", Dbuser);
      // console.log("Botp====", req.body.otp);
      // console.log("DBotp====", Dbuser.otp);
      if (Dbuser.otp != bOtp) {
        return res.status(400).json("please enter valied otp");
      }
      const bcryptPass = await bcrypt.hash(
        bPassword,
        Number(process.env.BCRYPT_KEY)
      );
      console.log("bcryptPassword", bcryptPass);
      const upDatePass = await userModel.findByIdAndUpdate(
        { _id: Dbuser._id },
        { password: bcryptPass, otp: "" },
        { new: true }
      );
      if (!upDatePass) return res.status(400).json("update error");
      return res.status(200).json("password update successfully");
    } catch (error) {
      console.log(error);
      return res.status(400).json({ mesaage: error });
    }
  },
  uploadProFile: async (req, res) => {
    // console.log("upload-profile", req.user);
    // console.log("upload-profile", req.file.location);
    // res.json({file:req.file})
    try {
      const userid = req.user._id;
      const newProFileImg = req.file.location;
      console.log("newProFileImg", newProFileImg);
      const addProfileImg = await userModel.findOneAndUpdate(
        { _id: userid },
        { profileImg: newProFileImg },
        { new: true }
      );
      // console.log("addProfileImg",addProfileImg);
      if (!addProfileImg.profileImg)
        return res.status(400).json({ message: "profileImg not store" });
      return res.status(200).json({ message: "profileImg upload sucessfuly" });
    } catch (error) {
      return res.status(400).json({ mesaage: error });
    }
  },
  updateProfile: async (req, res) => {
    // console.log("updetePrdvew",Bdata);
    const userId = req.user._id;
    //Database Data
    const dbUserData = await userModel.findById({ _id: userId });
    if (!dbUserData) return res.status(400).json("email not  exist ");
    
    //body data
   ;
    const bOldPass = req.body.oldPass;
    const bNewOass = req.body.newPass;
    const bNewEmail = req.body.newEmail;
    const bnewUserName = req.body.newUserName;
    if(!bOldPass && !bNewOass && !bNewEmail && !bnewUserName){
      return res.status(400).json("please enter field value");
    } 
console.log("bnewUserName===",bnewUserName);
    try {
     
      if (bNewOass && bOldPass) {
        console.log("password");
        const pasMatch = await bcrypt.compare(bOldPass, dbUserData.password);
        if (pasMatch === false)
          return res.status(400).json("please enter valid password");
        const bcryptPass = await bcrypt.hash(
          bNewOass,
          Number(process.env.BCRYPT_KEY)
        );
        console.log("bcryptPass", bcryptPass);
        //update password
        const updatePass = await userModel.findByIdAndUpdate(
          { _id: userId },
          { password: bcryptPass },
          { new: true }
        );
        if (!updatePass) return res.status(400).json("password not up");
      }
      if (bNewEmail) {
        console.log("email==>", bNewEmail);
        try {
          const updateEmail = await userModel.findByIdAndUpdate(
            { _id: userId },
            { email: bNewEmail },
            { new: true }
          );
          if (!updateEmail) return res.status(400).json("password not up");
        } catch (error) {
          if (error.keyValue.email)
            return res.status(409).json("email alrady exist");
        }
      } 
     if (bnewUserName) {
        console.log('bnewUserName',bnewUserName);
        const updateUsername = await userModel.findByIdAndUpdate(
          { _id: userId },
          { userName: bnewUserName },
          { new: true }
        );
        if (!updateUsername) return res.status(400).json("password not up");
      }
    return res.status(200).json("profile updated!");
    } catch (error) {
      return res.status(400).json({ mesaage: error });
    }
  },
};
