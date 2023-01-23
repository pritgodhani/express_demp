const express = require("express");
const router = express.Router();
const userController = require("../../controller/userController/user");
const {upload} = require("../../middlewere/multer")
const auth = require("../../middlewere/auth")

router.post("/sign-up", userController.createUser);

router.post("/login", userController.userLogin);
router.post("/forgot", userController.forgotPassword);
router.post("/forgot/verify", userController.verifyPassword);
router.post("/upload-profile",auth,upload.single('image'),userController.uploadProFile)
router.post("/update-profile",auth,upload.single('image'),userController.updateProfile)
module.exports = router;
