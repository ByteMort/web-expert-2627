import 'dotenv/config';
import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || "");
});

afterAll(async () => {
    await mongoose.disconnect();
});