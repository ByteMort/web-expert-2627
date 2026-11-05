import mongoose from 'mongoose';

const MONGO_URL = `mongodb://${process.env.MONGO_ADMIN}:${process.env.MONGO_PASS}@localhost:${process.env.MONGO_PORT}/wp3?authSource=admin`

export async function connectDB() {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully.");
}

export async function disconnectDB() {
    await mongoose.connection.close();
    console.log("Database connection closed.");
}