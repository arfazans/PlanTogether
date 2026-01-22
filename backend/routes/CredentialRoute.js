const express = require('express')
const router = express.Router();
const {signup,login,logout,updateProfile,checkAuth,getCurrentUser} = require("../controller/CredentialController")
const tokenAuth = require("../middleware/tokenAuth")
const upload = require('../config/multer');



router
.post("/signup",signup)
.post("/login", login)
.post("/logout", logout)
.put("/profile-update",  upload.single('profileImage'),tokenAuth ,updateProfile)
.get("/check-auth",tokenAuth,checkAuth)
.get("/me", tokenAuth, getCurrentUser);

module.exports = router
