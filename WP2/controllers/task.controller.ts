import type { NextFunction, Request, Response } from "express";
import { parseErrorMessages } from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { addTaskToUserS, findMyTasks, findTasks } from "../services/task.service.js";
import type { ITask } from "../models/task.model.js";
import { findUsers } from "../services/user.service.js";

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try{

        let tasks: ITask[];

        let title = "My Tasks";
        if(req.user?.role.includes('admin')){
            title = "Tasks"; 
            tasks = await findTasks();
        }else{
            tasks = await findMyTasks(req.user!.sub);
        }

        if(req.accepts("html")){
            return res.render("task", {
                title,
                tasks,
            });
        }

        return res.status(StatusCodes.OK).json({
            tasks
        });

    }catch(err: any){
        if(err.name === "MongoNetworkError" || err.name === "MongoServerSelectionError"){
            return next(err);
        }
        const errors = parseErrorMessages(err);

        if(req.accepts("html")){
            return res.render("task", {
                errors
            });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors
        });
    }
};

export const addTaskToUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(!req.user?.role.includes('admin')){
            throw new Error("You aren't allowed in this page!");
        }

        const body = req.body;
        if(!body.task_id) {
            throw new Error("Task id is required.");
        }
        if(!body.user_id){
            throw new Error("User id is required.");
        }

        await addTaskToUserS(body);

        if(req.accepts("html")){
            return res.render("task/task-user", {
                title: "Add Task to User",
                success: "Task Added to User Successfully!"
            });
        }
        return res.status(StatusCodes.OK).json({
            message: "Task Added to User Successfully!"
        });

    }catch(err:any){
        if(err.name === "MongoNetworkError" || err.name === "MongoServerSelectionError"){
            return next(err);
        }
        const errors = parseErrorMessages(err);

        if(req.accepts("html")){
            return res.render("task/task-user", {
                errors
            });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors
        });
    }
};

export const taskUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(!req.user?.role.includes('admin')){
            throw new Error("You aren't allowed in this page!");
        }
        
        let tasks = await findTasks();
        let users = await findUsers();

        return res.render('task/task-user', {
            title: "Add Task To User", 
            tasks,
            users,
        });
        
    }catch(err:any){
        if(err.name === "MongoNetworkError" || err.name === "MongoServerSelectionError"){
            return next(err);
        }
        const errors = parseErrorMessages(err);

        if(req.accepts("html")){
            return res.render("task/task-user", {
                errors
            });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors
        });
    }
};