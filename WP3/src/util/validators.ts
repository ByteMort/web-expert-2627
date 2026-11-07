import { addFormats, Ajv } from '@feathersjs/schema';

export const dataValidator = addFormats(new Ajv({}), ['date-time', 'uuid']);