# Library Manager

A server-rendered library management application built with Express, Pug, Sequelize, and SQLite. It provides forms for managing books and patrons, along with searchable, paginated collection pages.

## Features

- Create, view, update, and search books.
- Create, view, update, and search patrons.
- Assign each new patron a sequential library ID.
- Paginate book and patron lists, showing 10 records per page.
- Search case-insensitively with partial matches across each collection's fields (excluding the database ID).
- Validate required fields with Sequelize and display validation messages while retaining submitted form values.
- Display friendly not-found and server error pages.

## Requirements

- Node.js and npm

## Installation

From the project directory, install the dependencies:

```sh
npm install
```

## Run the application

Start the server with:

```sh
npm start
```

The application listens on port `3000` by default. Set the `PORT` environment variable to use another port. On startup, Sequelize synchronizes the models with the SQLite database and attempts to authenticate the connection.

## Database

The application uses SQLite. The development, test, and production configurations in `config/config.json` all use `library.db` as the database file. Sequelize creates or updates the `Books` and `Patrons` tables when the application starts.

### Book fields

- `title` (required)
- `author` (required)
- `genre`
- `first_published`

### Patron fields

- `first_name` (required)
- `last_name` (required)
- `address`
- `email` (required)
- `library_id` (required and unique; assigned automatically on creation)
- `zip_code`

Sequelize also manages each model's primary key and timestamps.

## Routes

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Home page |
| GET | `/books` | Searchable, paginated book list |
| GET | `/books/new` | New book form |
| POST | `/books/new` | Create a book |
| GET | `/books/:id` | View and edit a book |
| PUT | `/books/:id` | Update a book |
| GET | `/patrons` | Searchable, paginated patron list |
| GET | `/patrons/new` | New patron form |
| POST | `/patrons/new` | Create a patron and assign the next library ID |
| GET | `/patrons/:id` | View and edit a patron |
| PUT | `/patrons/:id` | Update a patron |

Collection pages accept `search` and `page` query parameters. For example, `/books?search=history&page=2` searches books and requests the second page of results.

## Project structure

- `app.js` — Express application setup, database synchronization, and error handling
- `bin/www` — HTTP server startup
- `config/config.json` — Sequelize database configuration
- `models/` — Sequelize model definitions and database instance
- `routes/` — Express route handlers
- `views/` — Pug templates
- `public/` — Static assets

## Development notes

The package currently provides `npm start`; no test script is defined in `package.json`.
