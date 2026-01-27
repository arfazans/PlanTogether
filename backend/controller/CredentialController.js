const CredentialModel = require("../model/CredentialModel");
const generateTokenAndSetCookie = require("../services/tokenServices");
const cloudinary = require('../config/cloudinary');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingUser = await CredentialModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const newUser = await new CredentialModel({ name, email, password }).save();

    try {
      generateTokenAndSetCookie(res, newUser);
    } catch (tokenError) {
      await CredentialModel.deleteOne({ _id: newUser._id });
      throw tokenError; // Let outer catch handle error response
    }

    res.json({ success: true, message: "Signup successful", userId: newUser._id });
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .json({ success: false, message: "SignUp fail, please try again" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await CredentialModel.findOne({ email });

    if (!user) {
      // User not found, send error and stop execution here
      return res.status(401).json({ error: "User not found" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });


    // Generate JWT token and set cookie
    try {
      generateTokenAndSetCookie(res, user);
    } catch (tokenError) {
      await CredentialModel.deleteOne({ _id: user._id });
      throw tokenError; // Let outer catch handle error response
    }
       // Send response with username
        res.json({
            message: "Logged in successfully",
            name: user.name,
            userId: user._id

        });
  } catch (err) {
    console.log('login route error',err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({success: true, message: "Logged out successfully" });
  } catch (err) {
    console.log('logout route error', err);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
}


const updateProfile = async(req,res)=>{
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (name) updateData.name = name;

    if (req.file) {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'PlanTogether/profileImage',
        transformation: [
          { width: 400, height: 400, crop: 'fill' }
        ]
      });
      updateData.profileImage = result.secure_url;
    }

    const updatedUser = await CredentialModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}

const checkAuth = async (req,res)=>{
  try {
    const user = await CredentialModel.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log("Error in checkAuth controller", err.message);
    res.status(500).json({message:"Internal Server Error"})
  }
}

module.exports = { signup, login,logout,updateProfile,checkAuth };
