import express, { errorHandler, json, notFound, rest } from '@feathersjs/express';
import { feathers } from '@feathersjs/feathers';
import cookieParser from 'cookie-parser';
import { services } from './services/index.js';
import { formatErrors } from './util/format-errors.js';

export const app = express.default(feathers());

app.use(json());
app.use(cookieParser());
app.configure(rest());
app.configure(services);

app.hooks({
    error: {
        all: [formatErrors]
    }
});

app.use(notFound());
app.use(errorHandler({html: false}));