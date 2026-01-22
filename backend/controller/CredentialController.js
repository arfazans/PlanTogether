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


const updateProfile = async(req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "posts/profileImage"
    });

    // Fix: Use uploadResult directly, not undefined profileImage variable
    const updateData = {
      name,
      profileImage: uploadResult.secure_url || uploadResult.url  // Store URL only
    };

    const updatedUser = await CredentialModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error); // Better logging
    res.status(500).json({ success: false, message: error.message });
  }
};


const checkAuth = (req,res)=>{
  try {
    res.status(200).json(req.user);
  } catch (err) {
console.log("Error in checkAuth controller", err.message);
res.status(500).json({message:"Internal Server Error"})
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await CredentialModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in getCurrentUser controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { signup, login,logout,updateProfile,checkAuth,getCurrentUser };
