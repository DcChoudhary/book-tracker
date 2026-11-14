# Book Tracker

A learning project with a Ruby on Rails JSON API, a React frontend, and PostgreSQL. Docker Compose runs the three services together for local development.

## Current features

- Create, list, view, edit, and delete books.
- Store each book's title, author, reading status, and optional rating.
- Use the React interface to work with the Rails API.

## Technology

- Ruby 3.3.1 and Rails 8.1.4
- React 19 and Vite 8
- PostgreSQL 18
- Docker and Docker Compose

## Run locally with Docker Compose

### Prerequisites

- Docker Desktop (or Docker Engine) with the Docker Compose plugin

From the repository root, build the app images and start the services:

```sh
docker compose up --build
```

The first run downloads the PostgreSQL image, installs the Ruby and JavaScript dependencies, and builds the Rails and frontend images. Compose waits for PostgreSQL's health check before starting Rails. Rails runs `db:prepare` on startup. Vite runs the React development server.

Open the app at <http://localhost:5173>. The Rails API is available at <http://localhost:3000>.

To run the services in the background:

```sh
docker compose up --build -d
```

To see service status and logs:

```sh
docker compose ps
docker compose logs -f
```

Stop and remove the containers and Compose network with:

```sh
docker compose down
```

The named PostgreSQL volume keeps database files when containers are removed. **Do not run `docker compose down -v` unless you intend to delete the database volume and its data.**

The Compose file contains a simple password for local practice. It is not suitable for a deployed environment.

## API

All book endpoints use the `/api/v1/books` path.

| Method | Path | Purpose | Success response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/books` | List books | `200 OK`, JSON array |
| `GET` | `/api/v1/books/:id` | Show one book | `200 OK`, JSON object |
| `POST` | `/api/v1/books` | Create a book | `201 Created`, currently an empty JSON object (`{}`) |
| `PUT` | `/api/v1/books/:id` | Update a book | `200 OK`, JSON object |
| `DELETE` | `/api/v1/books/:id` | Delete a book | `204 No Content` |

Create a book by sending a JSON object wrapped in `book`:

```json
{
  "book": {
    "title": "The Hobbit",
    "author": "J. R. R. Tolkien",
    "status": "want-to-read",
    "rating": 5
  }
}
```

Example request from a terminal:

```sh
curl -X POST http://localhost:3000/api/v1/books \
  -H 'Content-Type: application/json' \
  -d '{"book":{"title":"The Hobbit","author":"J. R. R. Tolkien","status":"want-to-read","rating":5}}'
```

The API also accepts partial book attributes in an update request, for example:

```json
{
  "book": {
    "title": "Updated title"
  }
}
```

## Project layout

```text
.
├── api/          # Rails API and its Dockerfile
├── frontend/     # React/Vite app and its Dockerfile
└── compose.yaml  # Local development services
```

## Development notes

- The API container connects to PostgreSQL using the Compose service name `db`.
- The frontend is served by Vite in development. Its source and the Rails source are mounted into their containers so code edits are visible while developing.
- PostgreSQL data and frontend `node_modules` use separate named volumes.
- The current Compose setup is for local development. Production deployment, authentication, file uploads, and automated delivery are not configured yet.

## Project roadmap

- [x] Build the Rails books CRUD API and React CRUD interface.
- [x] Run Rails, React, and PostgreSQL together with Docker Compose for development.
- [x] Document the current setup and API.
- [ ] Add automated checks and CI.
- [ ] Improve the interface and add book search/filtering.
- [ ] Add JWT authentication and per-user book authorization.
- [ ] Add file uploads and configure durable object storage for deployment.
- [ ] Prepare and deploy a production configuration.
- [ ] Extend CI/CD to deploy changes and create temporary preview environments for pull requests; remove previews when a pull request is merged or closed.