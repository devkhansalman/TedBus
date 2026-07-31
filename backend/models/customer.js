const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const customerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  themePreference: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  preferredLanguage: {
    type: String,
    enum: ["en", "hi", "fr", "de", "es", "ta"],
    default: "en",
  },
});

module.exports=mongoose.model("Customers",customerSchema)
