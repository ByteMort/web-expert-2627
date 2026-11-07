import mongoose, { Schema } from "mongoose"
import { randomUUID } from "node:crypto";

export interface IWorkout{
    _id: string,
    title: string,
    trainer: string,
    startTime: Date,
    durationMinutes: number,
    capacity: number,
    enrolledCount: number,
    updatedAt: Date,
    createdAt: Date
}

const workoutSchema = new Schema<IWorkout>(
    {
        _id: {
            type: String,
            default: () => randomUUID()
        },
        title: {
            type: String,
            required: [true, "Title of workout is required"],
            trim: true,
            minLength: [2, "Title should be at least {MINLENGTH} characters"],
            maxLength: [35, "Title can't be more than {MAXLENGTH} characters"],
            validate: {
                validator: (value: string) => /^[a-zA-Z0-9 ]+$/.test(value),
                message: (props) => `${props.value} is not a valid title`,
                type: 'invalidTitle'
            }
        },
        trainer: {
            type: String,
            required: [true, "Trainer of workout is required"],
            ref: 'User'
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"],
            validate: {
                validator: (value: Date) => value > new Date(),
                message: "Start time must be in the future",
                type: 'pastDate'
            }
        },
        durationMinutes: {
            type: Number,
            required: [true, "Duration of workout is required"],
            min: [30, "Duration must be at least {MIN} minutes"],
            max: [120, "Duration can't be more than {MAX} minutes"]
        },
        capacity: {
            type: Number,
            required: [true, "Capacity of workout is required"],
            min: [1, "Capacity must be at least {MIN}"],
            max: [20, "Capacity can't be more than {MAX}"]
        },
        enrolledCount: {
            type: Number,
            default: 0,
            min: [0, "Enrolled count cannot be negative"],
            validate: {
                validator: function (value: number){
                    /* v8 ignore start -- @preserve */
                    if (this instanceof mongoose.Query) {
                        return true;
                    }
                    /* v8 ignore stop -- @preserve */
                    return value <= this.capacity;
                },
                message: "Enrolled count cannot exceed capacity",
                type: 'overCapacity'
            }
        }
    },
    { collection: 'workouts', timestamps: true }
);

const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);
export default Workout;