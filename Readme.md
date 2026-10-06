# WP1

This project is structured as a custom mock server, modeled conceptually similar to `json-server`, powered by a YAML configuration file.

## Folder Structure

| Directory / File | Description |
| :--- | :--- |
| `public/` | All publicly used assets and templates |
| `public/css/` | CSS stylesheet files |
| `services/` | Service logic and business operations |
| `views/` | Template files (EJS) |
| `views/partials/` | Reusable template partial components |
| `tests/` | Test suite directory |
| `app.ts` | Main application entry point |
| `config.yml` | Standard YAML route and data definition file |
| `.env` | Environment configuration variables |

---

## Environment Variables

| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `PORT` | The port number on which the server runs | Required (Standard variable) |

---

## Scripts & Usage

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the application using the standard `config.yml` |
| `npm run dev <file-name>.yml` | Starts the application using a custom YAML configuration file |
| `npm run test` | Runs the test suite |

---

## API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Returns the `index.ejs` template |
| `GET` | `/:route` | Returns an array of items for the specified route |
| `GET` | `/:route/:id` | Returns a single object matching the ID |
| `GET` | `/:route?embed=field_name` | Returns an array, embedding related data via foreign keys |
| `GET` | `/:route/:id?embed=field_name` | Returns a single object, embedding related data via foreign keys |
| `POST` | `/:route` | Creates and adds a new object |
| `PUT` | `/:route/:id` | Updates an existing object |
| `DELETE` | `/:route/:id` | Deletes an existing object |

---

## Extra Features

| Feature | Query Parameters | Description |
| :--- | :--- | :--- |
| **Sorting** | `?sort=field_name&order=asc` / `desc` | Sorts the returned collection. If `order` is omitted, it defaults to `asc`. |
| **Limiting** | `?limit=number` | Limits the maximum number of items returned in the response. |
