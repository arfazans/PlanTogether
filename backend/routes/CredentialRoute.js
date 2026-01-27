const express = require('express')
const router = express.Router();
const {signup,login,logout,updateProfile,checkAuth} = require("../controller/CredentialController")
const tokenAuth = require("../middleware/tokenAuth")



router
.post("/signup",signup)
.post("/login", login)
.post("/logout", logout)
.put("/profile-update", tokenAuth,updateProfile)
.get("/check-auth",tokenAuth,checkAuth);

module.exports = router
