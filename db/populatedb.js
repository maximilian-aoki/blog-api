require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User } = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");

const users = [];
const posts = [];
const comments = [];

const uri = process.env.MONGO_DEV_URI;

main();
async function main() {
  try {
    await mongoose.connect(uri);
    console.log("connected to MongoDB");
    const session = await mongoose.startSession();
    console.log("session started");
    await mongoose.connection.transaction(
      async (session) => {
        console.log("transaction started");
        await createUsers();
        await createPosts();
        await createComments();
      },
      { readPreference: "primary" }
    );
    console.log("transaction completed successfully");
    await mongoose.connection.close();
    console.log("mongoose connection closed");
  } catch (err) {
    console.error(err);
    await mongoose.connection.close();
    console.log("mongoose connection closed");
  }
}

async function addOneUser(index, fullName, email, password, isAdmin) {
  console.log(`adding user ${index} with name '${fullName}'`);
  const bcryptHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    fullName,
    email,
    password: bcryptHash,
    isAdmin,
  });
  users[index] = newUser;
}

async function addOnePost(index, title, overview, text, isPublished, author) {
  console.log(`adding post ${index} with title '${title}'`);
  const newPost = await Post.create({
    title,
    overview,
    text,
    isPublished,
    author,
  });
  posts[index] = newPost;
}

async function addOneComment(index, text, author, post) {
  console.log(`adding comment ${index} with text '${text}'`);
  const newComment = await Comment.create({
    text,
    author,
    post,
  });
  comments[index] = newComment;
}

async function createUsers() {
  console.log("creating users");
  await Promise.all([
    addOneUser(0, "Maximilian Aoki", "admin@gmail.com", "123456", true),
    addOneUser(1, "Theodor Aoki", "theo@gmail.com", "234567", false),
    addOneUser(2, "Arhum Chaudhary", "arhum@gmail.com", "345678", false),
  ]);
}

async function createPosts() {
  console.log("creating posts");
  await Promise.all([
    addOnePost(
      0,
      "How to Tie a Tie",
      "This blog post will get into how to tie a tie",
      "Really it's not that hard - look up a video",
      true,
      users[0]
    ),
    addOnePost(
      1,
      "Different kinds of Cameras",
      "A not-very-in-depth review of cameras",
      "Some are DSLRs and some aren't - look up a video to learn more",
      false,
      users[0]
    ),
  ]);
}

async function createComments() {
  console.log("creating comments");
  await Promise.all([
    addOneComment(0, "Super inspiring article!", users[1], posts[0]),
    addOneComment(
      1,
      "Honestly I'm not convinced you added anything of value to the discussion",
      users[2],
      posts[0]
    ),
    addOneComment(
      2,
      "This is a test comment on an unpublished post",
      users[0],
      posts[1]
    ),
  ]);
}
