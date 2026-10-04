import express, { NextFunction, Request, Response } from "express";
import yaml from 'yaml';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = process.argv.slice(2)[0] || 'config.yml';
let config: any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try{
    config = yaml.parse(
        fs.readFileSync(path.join(__dirname, CONFIG), 'utf8')
    );
}catch(error){
    console.error(`Error reading or parsing config: ${error}`);
    process.exit(1);
}

app.use(express.json());

function checkRoute(req: Request, res: Response, next: NextFunction){
    const route = req.params.route;
    if(!config.routes.includes(route)){
        return res.status(404).json({
            error: `Route ${route} not found`
        });
    }
    next();
}

app.get('/', (req: Request, res: Response) => {
    res.send(`Configured routes: ${config.routes}`);
});

app.get('/:route', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const data = config[route] ||  [];
    
    res.json(data);
});

app.get('/:route/:id', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const id = req.params.id;
    const data = config[route] || [];

    const record = data.find((item:any) => item.id == id);

    if(!record){
        return res.status(404).json({
            error: `Record with ID ${id} not found in ${route}`
        });
    }
    res.json(record);
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error(`Server failed to start: ${err}`);
    process.exit(1);
})

const shutdown = () => {
    console.log("Shutting down...");
    server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);