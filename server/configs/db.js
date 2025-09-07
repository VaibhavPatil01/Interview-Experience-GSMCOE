import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      mongoose.connection.on('connected', () => {
        console.log("✅ Database Connected Successfully");
      });

      mongoose.connection.on('error', (err) => {
        console.error("❌ Mongoose Connection Error:", err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn("⚠️ Mongoose Disconnected");
      });
    }

    await mongoose.connect(`${process.env.MONGODB_URI}/Interview_Experience`);

  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

export default connectDB;
