const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profile: {
      displayName: {
        type: String,
        trim: true,
        default: "",
      },

      bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      profilePic: {
        type: String,
        default: "",
      },

    },
  },
  { timestamps: true }
);

// Hashng password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
