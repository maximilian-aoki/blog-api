require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connection.on("connected", () => console.log("connected to MongoDB"));
mongoose.connection.on("error", () => console.log("error in MongoDB"));
mongoose.connection.on("disconnected", () =>
  console.log("disconnected MongoDB")
);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DEV_URI);
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  connectDB,
};
