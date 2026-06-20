# KOSync

This is my implementation of [KOReader](https://koreader.rocks/) (Sync)[https://github.com/nperez0111/koreader-sync] — a personal project built without AI in coding.

My philosophy is to keep hand-coded logic alive. Every line of application code (routes, controllers, models, business logic) is written by hand. AI is only used as a productivity tool for ancillary tasks like generating this README, writing tests, or boilerplate documentation.

Credit goes to the hardworking contributors of KOReader and the wider ecosystem!

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.3+ (JavaScript runtime & package manager)
- SQLite (bundled with Bun, no separate install needed)

### Clone & Install

```bash
git clone https://github.com/dhavalsavalia/kosync.git
cd kosync
bun install
```

### Run the Server

```bash
# Development (with hot reload)
bun run server:dev

# Production
bun run server
```

The server starts at `http://localhost:3000` by default.

### Seed the Database

```bash
bun run db:seed
```

### Run Tests

```bash
bun test --coverage --preload ./src/tests/setup.ts
```

### Docker

Two Docker configurations are provided:

```bash
# Development (with hot reload + volume mount)
docker compose up api-dev

# Production
docker compose up api
```

## Environment Variables

| Variable                   | Default                  | Description                              |
| -------------------------- | ------------------------ | ---------------------------------------- |
| `PORT`                     | `3000`                   | Server port                              |
| `DB_FILE_PATH`             | `./data/db.sqlite`       | SQLite database file path                |
| `DISABLE_USER_REGISTRATION`| `true`                   | Disables new user registration endpoint  |
| `CORS_ORIGIN`              | `*`                      | CORS allowed origin                      |

## OpenAPI Documentation

The server exposes an OpenAPI 3.0 specification at the `/openapi` endpoint. This is auto-generated from route definitions using [@elysia/openapi](https://github.com/elysiajs/openapi).

You can view the interactive Swagger UI at `/swagger` once the server is running.

## Project Structure

```
kosync/
├── src/
│   ├── index.ts                    # Entry point — server setup, middleware, routes
│   ├── routes/
│   │   └── users.ts                # User CRUD route definitions
│   ├── controllers/
│   │   └── user.controller.ts      # Request handling & delegation to model
│   ├── models/
│   │   └── user.model.ts           # Data access layer (SQLite queries, business logic)
│   └── tests/
│       ├── setup.ts                # Test lifecycle hooks (DB cleanup)
│       ├── mocks/
│       │   └── user.factory.ts     # Factory for creating mock users in tests
│       └── models/
│           └── user.model.spec.ts  # Unit tests for UserModel (16 tests)
├── db/
│   ├── db.ts                       # SQLite connection & schema initialization
│   └── seeders/
│       └── mock-users.seeder.ts    # Seeds DB with fake users via Faker
├── data/                           # Local SQLite database file (gitignored)
├── Dockerfile                      # Production Docker image
├── Dockerfile.dev                  # Development Docker image (hot reload)
├── docker-compose.yaml             # Docker Compose services
└── package.json                    # Project metadata & scripts
```

## The Spec

### API Endpoints

| Endpoint        | Method | Purpose                | Payload / Response                                                                                        |
| --------------- | ------ | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `/users/create` | POST   | Registers a new user.  | **Body:** `{ "username": "...", "password_hash": "..." }`<br>**Returns:** `201 Created` or `409 Conflict` |
| `/users/auth`   | POST   | Validates credentials. | **Body:** `{ "username": "...", "password_hash": "..." }`<br>**Returns:** `200 OK` or `401 Unauthorized`  |
| `/users/:id`    | DELETE | Deletes a user by ID.  | **Params:** `{ "id": number }`<br>**Returns:** `200 OK` or `404 Not Found`                                |
| `/health`       | GET    | Health check endpoint. | **Returns:** `{ "status": "ok" }`                                                                         |

### User Model

The `User` model provides the following methods:

| Method            | Purpose                      | Returns            | Throws                                          |
| ----------------- | ---------------------------- | ------------------ | ----------------------------------------------- |
| `getById(id)`     | Retrieves a user by ID       | `User`             | `NotFoundError` if user doesn't exist           |
| `getByUsername()` | Retrieves a user by username | `User`             | `NotFoundError` if user doesn't exist           |
| `deleteById(id)`  | Deletes a user by ID         | `void`             | `NotFoundError` if user doesn't exist           |
| `create(data)`    | Creates a new user           | `number` (user ID) | `UserAlreadyExistsError`, `InternalServerError` |
| `authenticate()`  | Validates user credentials   | `void`             | `UnauthorizedError` if credentials invalid      |

### Test Coverage

The `UserModel` has comprehensive test coverage (16 tests):

- **`#getById`** (3 tests): User lookup, not found, deleted user
- **`#getByUsername`** (3 tests): Username lookup, not found, deleted user
- **`#deleteById`** (2 tests): User deletion, not found
- **`#create`** (4 tests): User creation, ID return, duplicate handling, multiple users
- **`#authenticate`** (4 tests): Valid credentials, invalid password, non-existent user, case sensitivity

Run tests with: `bun test --coverage --preload ./src/tests/setup.ts`