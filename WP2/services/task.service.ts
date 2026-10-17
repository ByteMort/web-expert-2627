import Task from "../models/task.model.js"
import User from "../models/user.model.js";

export const findMyTasks = async (id:string) => {
    return await Task.find({userId: id});
}

export const findTasks = async () => {
    return await Task.find();
}

export const addTaskToUserS = async(body: {task_id: string, user_id: string}) => {
    let task = await Task.findById(body.task_id);

    if(!task){
        throw new Error("There is no task with this id.");
    }

    let user = await User.findById(body.user_id);

    if(!user){
        throw new Error("There is no user with this id.");
    }

    task.userId = user._id;

    await task.save();
}