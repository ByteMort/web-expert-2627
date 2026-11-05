import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(express.json());
app.use(cookieParser());

// Routers
app.get('/', (req: Request, res: Response)=>{
    res.json({"message": "hello"});
});

