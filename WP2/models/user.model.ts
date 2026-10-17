import mongoose, {Document, Schema} from "mongoose";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

export interface IUser extends Document<string>{
    _id: string,
    username: string,
    role?: string[],
    password?: string,
    hashedPass: string,
    createdAt: Date,
    updatedAt: Date,
};

const userSchema = new Schema<IUser>({
    _id: {
        type: String,
        default: () => randomUUID()
    },
    username: {
        type: String,
        required: [true, "Username is required."],
        trim: true,
        unique: true,
        minLength: [2, "Username should be at least {MINLENGTH} characters."],
        maxLength: [15, "Username can't be more than {MAXLENGTH} characters."],
        validate: {
            validator: (value) => {
                return /^[a-zA-Z0-9]+$/.test(value);
            },
            message: (props) => {
                return `${props.value} is not a valid username.`;
            }
        }
    },
    role: {
        type: [String],
        enum: ['user', 'admin'],
        default: ['user']
    },
    hashedPass: {
        type: String,
        required: true
    }
}, {collection: 'users', timestamps: true});

userSchema
    .virtual('password')
    .set(function(password:string){
        if(!password){
            this.invalidate('password', 'Password is required.');
            return;
        }

        const trimmedPass = password.trim();
        if(trimmedPass.length < 6){
            this.invalidate('password', 'Password must be at least 6 characters.');
        }
        if(trimmedPass.length > 20){
            this.invalidate('password', 'Password must be shorter than 20 characters.');
        }

        this.hashedPass = bcrypt.hashSync(trimmedPass, 10);
    });


export default mongoose.model<IUser>('User', userSchema);