import express, { errorHandler, json, notFound, rest } from '@feathersjs/express';
import { feathers } from '@feathersjs/feathers';
import cookieParser from 'cookie-parser';
import { services } from './services/index.js';
import { formatErrors } from './util/format-errors.js';
import { authenticateUnlessPublic, parseAuthCookie } from './middlewares/auth-cookie.js';

export const app = express.default(feathers());

app.use(json());
app.use(cookieParser());
app.use(parseAuthCookie);
app.configure(rest());
app.configure(services);

app.hooks({
  before: {
    all: [authenticateUnlessPublic]
  },
  error: {
    all: [formatErrors]
  }
});

app.use(notFound());
app.use(errorHandler({html: false}));
