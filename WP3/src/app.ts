import express, { errorHandler, json, notFound, rest } from '@feathersjs/express';
import { feathers } from '@feathersjs/feathers';
import cookieParser from 'cookie-parser';
import { services } from './services/index.js';
import { formatErrors } from './util/format-errors.js';
import { parseAuthCookie } from './middlewares/auth-cookie.js';
import { authenticateUnlessPublic } from './hooks/authenticate.js';
import socketio from '@feathersjs/socketio';
import { channels } from './channels.js';

export const app = express.default(feathers());

app.use(json());
app.use(cookieParser());
app.use(parseAuthCookie);
app.configure(rest());
app.configure(socketio());
app.configure(services);
app.configure(channels);

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
