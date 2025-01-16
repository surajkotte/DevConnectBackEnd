const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://youcantopen9640:practice@practice.mrn5a.mongodb.net/devConnect"
  );
};
module.exports = { connectDB };
