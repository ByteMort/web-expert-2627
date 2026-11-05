import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { randomUUID } from 'node:crypto';

export interface IUser{
    _id: string,
    username: string,
    password?: string,
    hashedPass: string,
    role: string,
    createdAt: Date,
    updatedAt: Date
};

const userSchema = new Schema<IUser>({
    _id: {
        type: String,
        default: () => randomUUID(),
    },
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: true,
        trim: true,
        minLength: [2, "Username should be at least {MINLENGTH} characters."],
        maxLength: [15, "Username can't be more than {MAXLENGTH} characters."],
        validate: {
            validator: (value: string) => {
                if(value.toLowerCase().includes('admin')){
                    throw new Error("Username cannot contain 'admin'");
                }
                return /^[a-zA-Z0-9]+$/.test(value);
            },
            message: (props) => {
                if(props.reason){
                    return props.reason.message;
                }
                return `${props.value} is not a valid username.`;
            }
        }
    },
    hashedPass: {
        type: String,
        required: [true, "Password is required."]
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: "{VALUE} is not a valid role."
        },
        default: 'user'
    },
}, {collection: 'users', timestamps: true});

userSchema
    .virtual('password')
    .set(function(password: string){
        if(!password){
            this.invalidate('password', "Password is required.");
            return;
        }

        const trimmedPass = password.trim();
        if(trimmedPass.length < 6){
            this.invalidate('password', "Password must be at least 6 characters.");
            return;
        }
        if(trimmedPass.length > 20){
            this.invalidate('password', "Password must be shorter than 20 characters.");
            return;
        }

        this.hashedPass = bcrypt.hashSync(trimmedPass, 10);
    });

const User = mongoose.model<IUser>('User', userSchema);
export default User;