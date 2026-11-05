import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import User, { type IUser } from './models/user.model.js';

type SeedUser = Pick<IUser, 'username' > & {password: string; role?: string};

async function seedData() {
    try{
        console.log("Seeding started...");
        await connectDB();

        await User.deleteMany();

        const users: SeedUser[] = [
            {username: "Ali", password: 'adminn', role: 'admin'},
            {username: "Bob", password: "bob123"}
        ];

        await User.insertMany(users);

        console.log("Seed data successfully saved.");
    }catch(error){
        console.error(`Seed Error: ${error}`);
        process.exitCode = 1;
    }finally{
        console.log("Seeding finished.");
        await disconnectDB();
        process.exit();
    }
}

seedData();