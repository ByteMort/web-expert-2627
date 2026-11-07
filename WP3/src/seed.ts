import 'dotenv/config';
import { connectDB, disconnectDB } from './configs/db.js';
import User, { type IUser } from './models/user.model.js';

type SeedUser = Pick<IUser, 'username' > & {password: string; role?: string};

async function seedData() {
    try{
        console.log("Seeding started...");
        await connectDB();

        await User.deleteMany();

        const users: SeedUser[] = [
            {username: "Ali", password: 'adminn', role: 'admin'},
            {username: "Bob", password: "bob123"},
            {username: "Trainer1", password: "trainer", role: 'trainer'},
            {username: "Trainer2", password: "trainer", role: 'trainer'},
            {username: "Trainer3", password: "trainer", role: 'trainer'},
            {username: "Trainer4", password: "trainer", role: 'trainer'},
            {username: "Trainer5", password: "trainer", role: 'trainer'},
            {username: "Trainer6", password: "trainer", role: 'trainer'},
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