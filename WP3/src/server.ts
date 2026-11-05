import 'dotenv/config';
import { app } from './app.js';
import type { Server } from 'node:http';
import { connectDB, disconnectDB } from './configs/db.js';

const PORT:number = Number(process.env.PORT) || 3000;

let server: Server | undefined;

async function start() {
    try{
        await connectDB();

        server = await app.listen(PORT);
        console.log(`The server is listening to http://localhost:${PORT}`);
    }catch(error){
        console.error(`Starting error: ${error}`);
        process.exit(1);
    }
}

async function shutdown(signal: string){
    try{
        console.log(`${signal} received, shutting down...`);

        if(server){
            await new Promise<void>((resolve) => server!.close(() => resolve()));
        }
        
        await disconnectDB();

        process.exit(0);
    }catch(error){
        console.error(`Something went wrong while shutdown: ${error}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown("SIGINT"));
process.on('SIGTERM', () => shutdown("SIGTERM"));

start();