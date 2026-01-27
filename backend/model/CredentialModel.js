const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');


const credentialSchema = new mongoose.Schema({
    name:  {type:String,required:true},
    email: { type: String, required: true },
    password: { type: String, required: true },
},
{   timestamps: true }
);

// Hash password before saving
credentialSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password during login
credentialSchema.methods.comparePassword =  function (candidatePassword) {
  return  bcrypt.compare(candidatePassword, this.password);
};

const credentialmodels = mongoose.model("Credential",credentialSchema)

module.exports = credentialmodels