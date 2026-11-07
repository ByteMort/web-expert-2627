import { Forbidden } from '@feathersjs/errors';
import type { HookContext, Params } from '@feathersjs/feathers';

export const requireAdmin = async (context: HookContext) => {
    const params = context.params as Params & { user?: { id: string; role: string } };

    if(params.user?.role !== 'admin'){
        throw new Forbidden('Admin access required');
    }
};