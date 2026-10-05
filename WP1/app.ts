import express, { NextFunction, Request, Response } from "express";
import 'dotenv/config';
import { 
    ROOT_DIR, config, getRoute, 
    getRouteById, addDataToRoute,
    deleteDataFromRoute, updateDataFromRoute,
    fromRAMToYML
} from "./services/route_service";
import path from "node:path";


export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(ROOT_DIR, 'public')));
app.use(express.json());
app.set('views', path.join(ROOT_DIR, 'views'));
app.set('view engine', 'ejs');

function checkRoute(req: Request, res: Response, next: NextFunction){
    const route = req.params.route;
    if(!config.routes.includes(route)){
        return res.status(404).json({
            error: `Route ${route} not found`
        });
    }
    next();
};

app.get('/', (req: Request, res: Response) => {
    // res.send(`Configured routes: ${config.routes}`);
    return res.render('index', {
        title: "Routes",
        config: config
    });
});

app.get('/:route', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const embed = req.query.embed as string;
    const data = getRoute(route, embed);
    return res.json(data);
});

app.get('/:route/:id', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const id = req.params.id as string;
    const embed = req.query.embed as string;
    const record = getRouteById(route, id, embed);
    if(!record){
        return res.status(404).json({
            error: `Record with ID ${id} not found in ${route}`
        });
    }
    return res.json(record);
});

app.post('/:route', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const body = req.body;
    if(!body){
        return res.status(400).json({
            error: 'Request body cannot be empty'
        });
    }
    const result = addDataToRoute(route, body);
    if(!result[0]){
        return res.status(500).json({
            error: `Something went wrong: ${result[1]}`
        });
    }
    return res.redirect(`/${route}`);
});

app.put('/:route/:id', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const id = req.params.id as string;
    const body = req.body;

    if(!body){
        return res.status(400).json({
            error: 'Request body cannot be empty'
        });
    }

    const result = updateDataFromRoute(route, id, body);
    if(!result[0]){
        return res.status(500).json({
            error: `Something went wrong: ${result[1]}`
        });
    }
    return res.redirect(`/${route}`);
});

app.delete('/:route/:id', checkRoute, (req: Request, res: Response) => {
    const route = req.params.route as string;
    const id = req.params.id as string;
    const result = deleteDataFromRoute(route, id);
    if(!result[0]){
        return res.status(400).json({
            error: `Something went wrong: ${result[1]}`
        });
    }
    return res.redirect(`/${route}`);
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error(`Server failed to start: ${err}`);
    process.exit(1);
});

const shutdown = () => {
    console.log("Shutting down...");
    fromRAMToYML();
    server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);