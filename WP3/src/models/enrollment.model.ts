import mongoose, { Schema } from 'mongoose'
import { randomUUID } from 'node:crypto';

export interface IEnrollment{
    _id: string,
    workout: string,
    user: string,
    createdAt: Date,
    updatedAt: Date
}

const enrollmentSchema = new Schema<IEnrollment>(
    {
        _id: {
            type: String,
            default: () => randomUUID()
        },
        workout: {
            type: String,
            ref: 'Workout',
            required: [true, "Workout is required"]
        },
        user: {
            type: String,
            ref: 'User',
            required: [true, "User is required"]
        }
    },
    { collection: 'enrollments', timestamps: true }
);

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
export default Enrollment;