import mongoose from 'mongoose';
import User, { type IUser } from './models/user.model.js';
import 'dotenv/config';
import Task, { type ITask } from './models/task.model.js';

const MONGO_URI:string = process.env.MONGO_URI || "";

async function seed(){
    try{
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected for seeding....");

        await User.deleteMany({});
        await Task.deleteMany({});
        console.log("Existing users and tasks deleted.");

        const seedAdmin = new User({
            username: "MyAdmin",
            role: ['admin'],
            password: "myPass",
        });

        await seedAdmin.save();

        const users: IUser[] = [
            new User({username: "Bob", password: "bob123"}),
            new User({username: "Alice", password: "alice123"}),
            new User({username: "Jack", password: "jack123"})
        ];

        const tasks: ITask[] = [
            new Task({title: "Task1", userId: users[0]?._id}),
            new Task({title: "Task2", userId: users[0]?._id}),
            new Task({title: "Task3", userId: users[1]?._id}),
            new Task({title: "Task4", userId: users[1]?._id})
        ];

        await User.insertMany(users);
        await Task.insertMany(tasks);

        console.log("Users and Tasks saved in db.");

    }catch(err){
        console.error("Something went wrong while seeding: " + err);
    }finally{
        await mongoose.connection.close();
        console.log("MongoDB disconnected.");
    }
}

seed();