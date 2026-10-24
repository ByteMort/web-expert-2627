import express from 'express';
import 'dotenv/config';
import path from "node:path";
import mainRouter from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import mongoose from 'mongoose';
import http from "http";
import cookieParser from 'cookie-parser';

export const app = express();
const PORT:number = Number(process.env.PORT) || 3000;
const MONGO_URI:string = process.env.MONGO_URI || "";

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/api', mainRouter);

// app.use(express.static(path.join(import.meta.dirname, 'public')));
// app.set('views', path.join(import.meta.dirname, 'views'));
// app.set('view engine', 'ejs');

app.use('/axios', express.static(path.join(import.meta.dirname, 'node_modules/axios/dist')));
app.use(express.static(path.join(import.meta.dirname, 'frontend')));


app.use(globalErrorHandler);

let server: http.Server;
const startServer = async() => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Database connected successfully.");

        server = app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        }).on('error', (err) => {
            console.log(`App failed with error: ${err}`);
            process.exit(1);
        });

    }catch(error){
        console.log(`Database connection failed: ${error}`);
        process.exit(1);
    }
};

if (!process.env.VITEST) {
    startServer();
}

const shutdown = async () => {
    console.log("Shuting down...");

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    if(server){
        server.close(() => {
            console.log("HTTP server close.");
            process.exit(0);
        });
    }else{
        process.exit(0);
    }
}

if (!process.env.VITEST) {
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}