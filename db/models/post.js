const mongoose = require("mongoose");
const { userSchema } = require("./user");
const { DateTime } = require("luxon");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    author: userSchema,
  },
  { timestamps: true }
);

postSchema.virtual("publicUrl").get(function () {
  return `/api/public/posts/${this.id}`;
});

postSchema.virtual("privateUrl").get(function () {
  return `/api/private/posts/${this.id}`;
});

postSchema.virtual("date").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Post", postSchema);
