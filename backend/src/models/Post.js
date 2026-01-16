import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousAlias: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    video: {
      type: String,
      default: ""
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
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          const validTags = [
            "Tea", "MessyButTrue", "NotNamingNames", "IfYouKnowYouKnow",
            "UnpopularOpinion", "HotTake", "Don'tCancelMe", "ThisMightBeWild",
            "Controversial", "BigSisEnergy", "Confession", "IHaveToSayThis",
            "OffMyChest", "JustBeingHonest", "PassingThought", "Anonymous",
            "GhostPost", "PrivateThought", "RandomThought", "NoBigDeal",
            "LateNightThoughts"
          ];
          return arr.every(tag => validTags.includes(tag));
        },
        message: "Invalid tag selected"
      }
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousAlias: {
      type: String,
      default: null
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    likes: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          isAnonymous: {
            type: Boolean,
            default: false
          },
          anonymousAlias: {
            type: String,
            default: null
          }
        }
      ],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

postSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.__v;
    return ret;
  }
});

export const Post = mongoose.model("Post", postSchema);
