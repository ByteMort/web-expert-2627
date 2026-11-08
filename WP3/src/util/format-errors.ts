import { BadRequest, Conflict, FeathersError, GeneralError } from '@feathersjs/errors';
import type { HookContext } from '@feathersjs/feathers';
import mongoose from 'mongoose';

type FieldError = { field: string; message: string };

type AjvError = {
    instancePath?: string,
    message?: string,
    params?: { missingProperty?: string, additionalProperty?: string };
};

export const formatErrors = async (context: HookContext) => {
    const error = context.error;

    if(error instanceof BadRequest && Array.isArray(error.data)){
        const fields: FieldError[] = error.data.map((e: AjvError) => ({
            field:
                e.instancePath?.slice(1) ||
                e.params?.missingProperty ||
                e.params?.additionalProperty ||
                'body',
            message: e.message ?? 'Invalid value'
        }));
        context.error = new BadRequest('Validation failed', fields);
        return;
    }

    if(error instanceof mongoose.Error.ValidationError){
        const fields: FieldError[] = Object.values(error.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
        context.error = new BadRequest('Validation failed', fields);
        return;
    }

    if(error?.code === 11000){
        const field = Object.keys(error.keyValue ?? {})[0] ?? 'field';
        context.error = new Conflict(`${field} already exists`, [
            {field, message: `${field} already exists`}
        ]);
        return;
    }

    if (error?.type === 'FeathersError' && !(error instanceof FeathersError)) {
        context.error = new FeathersError(error.message, error.name, error.code, error.className, error.data);
        return;
    }

    if(!(error instanceof FeathersError)){
        console.error(error);
        context.error = new GeneralError('Something went wrong');
    }
};
