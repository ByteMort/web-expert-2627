import type { Application } from '@feathersjs/express';
import '@feathersjs/transport-commons';

export const channels = (app: Application) => {
    app.on('connection', (connection) => {
        app.channel('everybody').join(connection);
    });

    app.service('api/workouts').publish(() => app.channel('everybody'));

    app.service('api/enrollments').publish((data) =>
        app.channel('everybody').send({ workout: data.workout })
    );
};