import User from "../models/user.model.js";

export const findUsers = async () => {
    return await User.find();
};