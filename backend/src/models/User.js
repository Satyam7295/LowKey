import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 120
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false // exclude hashed password from queries by default
    },
    profilePic: {
      type: String,
      default: ""
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 tags allowed"
      }
    },
    poll: {
      question: {
        type: String,
        default: ""
      },
      options: {
        type: [String],
        default: [],
        validate: {
          validator: function (arr) {
            return arr.length <= 5;
          },
          message: "Maximum 5 poll options allowed"
        }
      }
    },
    gallery: {
      type: [String],
      default: []
    },
    video: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500
    },
    prompts: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true
          },
          answer: {
            type: String,
            required: true,
            trim: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Maximum 5 prompts allowed"
      }
    },
    friendRequests: {
      type: [
        {
          from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    pokes: {
      type: [
        {
          from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    asks: {
      type: [
        {
          from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          message: {
            type: String,
            required: true,
            trim: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    spillback: {
      type: [
        {
          question: {
            type: String,
            required: true,
            trim: true
          },
          answer: {
            type: String,
            required: true,
            trim: true
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
