import mongoose, {Document, Schema} from "mongoose";
import { randomUUID } from "node:crypto";

export interface ITask extends Document<string>{
    _id: string,
    title: string,
    completed?: boolean,
    userId?: string,
    createdAt: Date,
    updatedAt: Date
}

const taskSchema = new Schema<ITask>({
    _id: {
        type: String,
        default: () => randomUUID()
    },
    title: {
        type: String,
        required: [true, "Title is required for a task."],
        trim: true,
        minLength: [3, "Title should be at least 3 characters."],
        maxLength: [150, "Title can't be more than 150 characters."]
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: String,
        ref: 'User'
    }
}, {collection: 'tasks', timestamps: true});

export default mongoose.model<ITask>('Task', taskSchema);