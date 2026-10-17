import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import jwt from "jsonwebtoken";
import type { JWTClaims } from "../middlewares/auth.middleware.js";

export const addUser = async (userData: {username: string, password: string}) => {
    const user = new User(userData);
    return await user.save();
};

export const logUser = async(userData: {username: string, password: string}) => {
    const foundUser = await User.findOne({username: userData.username});
    if(!foundUser){
        throw new Error("User doesn't exist.");
    }

    if(!bcrypt.compareSync(userData.password, foundUser.hashedPass)){
        throw new Error("Invalid credentials.");
    }

    let claims: JWTClaims = {
        sub: foundUser._id,
        username: foundUser.username,
        role: foundUser.role || ['user']
    };

    const secretKey = process.env.JWT_SECRET;
    if(!secretKey){
        throw new Error("There is no key for jwt tokens in server.");
    }

    const token = jwt.sign(
        claims,
        secretKey,
        { expiresIn: "1h"}
    );

    return {user: foundUser, token};
};