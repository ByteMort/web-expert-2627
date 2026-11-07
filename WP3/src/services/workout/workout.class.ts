import { BadRequest, NotFound } from '@feathersjs/errors';
import User, { type IUser } from '../../models/user.model.js';
import Workout, { type IWorkout } from '../../models/workout.model.js';
import type { CreateWorkout, PatchWorkout } from './workout.schema.js';

async function ensureTrainer(id: string) {
    const trainer: IUser | null = await User.findById(id);
    if (!trainer || trainer.role !== 'trainer') {
        throw new BadRequest("There is no trainer with this id");
    }
}

export class WorkoutService{
    async create(data: CreateWorkout) {
        await ensureTrainer(data.trainer);

        const savedWorkout = await Workout.create({
            title: data.title,
            trainer: data.trainer,
            startTime: data.startTime,
            durationMinutes: data.durationMinutes,
            capacity: data.capacity
        });

        return savedWorkout.toObject();
    }

    async find(){
        const workouts: IWorkout[] = await Workout.find().populate('trainer', 'username role').lean();
        return workouts;
    }

    async get(id: string){
        const workout: IWorkout | null = await Workout.findById(id).populate('trainer', 'username role').lean();
        if(!workout){
            throw new NotFound("There is no workout with this id");
        }
        return workout;
    }

    async remove(id: string){
        const deletedWorkout = await Workout.findByIdAndDelete(id).lean();
        if(!deletedWorkout){
            throw new NotFound("There is no workout with this id");
        }
        return deletedWorkout;
    }

    async patch(id: string, data: PatchWorkout){
        if (data.trainer) {
            await ensureTrainer(data.trainer);
        }

        const workout = await Workout.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
        if(!workout){
            throw new NotFound("There is no workout with this id");
        }
        return workout;
    }
}