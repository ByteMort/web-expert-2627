import type { Params } from "@feathersjs/feathers";
import type { CreateEnrollment } from "./enrollment.schema.js";
import Workout from "../../models/workout.model.js";
import { BadRequest, Conflict, Forbidden, NotFound } from "@feathersjs/errors";
import type { IEnrollment } from "../../models/enrollment.model.js";
import Enrollment from "../../models/enrollment.model.js";

type UserParams = Params & { user?: { id: string, role: string } };

export class EnrollmentService{
    async create(data: CreateEnrollment, params?: UserParams) {
        const userId = params!.user!.id;

        const enrollmentOfUser = await Enrollment.findOne({
            user: userId,
            workout: data.workout
        }).lean();
        if(enrollmentOfUser){
            throw new BadRequest("You are already in this workout");
        }

        const updated = await Workout.findOneAndUpdate(
            {
                _id: data.workout,
                startTime: { $gt: new Date() },
                $expr: { $lt: ['$enrolledCount', '$capacity'] }
            },
            { $inc: { enrolledCount: 1 } },
            { new: true }
        ).lean();

        if(!updated){
            const workout = await Workout.findById(data.workout).lean();
            if (!workout) {
                throw new BadRequest("There is no workout with this id");
            }
            if (workout.startTime <= new Date()) {
                throw new BadRequest("Cannot enroll in a past workout");
            }
            throw new Conflict("This workout is full");
        }

        try {
            const savedEnrollment = await Enrollment.create({
                user: userId,
                workout: data.workout
            });

            return savedEnrollment.toObject();
        } catch (error) {
            await Workout.updateOne(
                { _id: data.workout },
                { $inc: { enrolledCount: -1 } }
            );
            throw error;
        }
    }

    async remove(id: string, params?: UserParams) {
        const user = params!.user!;

        const enrollment = await Enrollment.findById(id).lean();
        if (!enrollment) {
            throw new NotFound("There is no enrollment with this id");
        }

        if (enrollment.user !== user.id && user.role !== 'admin') {
            throw new Forbidden("You can only remove your own enrollment");
        }

        const deleted = await Enrollment.findByIdAndDelete(id).lean();
        /* v8 ignore start -- @preserve */
        if (!deleted) {
            throw new NotFound("There is no enrollment with this id");
        }
        /* v8 ignore stop -- @preserve */

        await Workout.updateOne(
            { _id: deleted.workout },
            { $inc: { enrolledCount: -1 } }
        );

        return deleted;
    }

    async find(params?: UserParams) {
        const user = params!.user!;

        const filter = user.role === 'admin' ? {} : { user: user.id };

        return Enrollment.find(filter)
            .populate('workout', 'title startTime')
            .populate('user', 'username')
            .lean();
    }
}