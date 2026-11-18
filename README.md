# MyTasks API

MyTasks is a task-tracking backend for creating and managing a personal to-do
list. Each task has an auto-generated numeric `id`, a required `title`, a
`done` flag that defaults to `false`, and an integer `priority` that defaults
to `0`. PostgreSQL stores the tasks; schema changes are managed with TypeORM
migrations.

## Task routes

| Action | Method | URL |
| --- | --- | --- |
| List all tasks | GET | `/tasks` |
| Get one task | GET | `/tasks/:id` |
| Create a task | POST | `/tasks` |
| Update a task | PATCH | `/tasks/:id` |
| Delete a task | DELETE | `/tasks/:id` |

Creating, updating, and deleting tasks require a JWT Bearer token. Register
with `POST /auth/register`, then log in with `POST /auth/login` to get an
`accessToken`. A task request body must include a non-empty string `title`;
updates may also include `done`.

## Run and test

Run `npm install`, configure the database and `JWT_SECRET` in `.env`, apply
migrations with `npm run migration:run`, then start the API with
`npm run start:dev`. Run unit tests with `npm run test` and API end-to-end
tests with `npm run test:e2e`.

Alternatively, start the API, PostgreSQL, and Redis together with
`docker compose up --build`. Compose runs migrations before starting the API
and persists database data in a named volume. Its local-only default database
is published on port `5433`; set `DB_HOST=localhost`, `DB_PORT=5433`,
`DB_USERNAME=mytasks`, `DB_PASSWORD=local-only-change-me`,
`DB_DATABASE=mytasks`, and `DB_SSL=false` when running laptop migrations or
e2e tests against that database. Set `DOCKER_POSTGRES_PASSWORD` and
`DOCKER_JWT_SECRET` to non-default values when changing the local credentials.
