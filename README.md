# Open Music API

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher recommended)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Redis](https://redis.io/)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mrsyafapri/openmusic-api.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd openmusic-api
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Create the database**:

   Ensure PostgreSQL is running and create a new database for the application. You can do this using a PostgreSQL client like `psql`:

   ```sql
   CREATE DATABASE openmusicdb;
   ```

5. **Migrate the database**:

   Run the migration scripts to set up the database schema:

   ```bash
   npm run migrate up
   ```

## Running the Application

1. Start the application:
   ```bash
   npm run start:dev
   ```
2. Access the application:

   Open your browser and go to http://localhost:5000

## Configuration

Create a `.env` file in the root directory and add your configuration:

```env
# Server configuration
HOST=your_host
PORT=your_port

# node-postgres configuration
PGUSER=your_pg_user
PGHOST=your_pg_host
PGPASSWORD=your_pg_password
PGDATABASE=your_pg_database
PGPORT=your_pg_port

# JWT Token
ACCESS_TOKEN_KEY=your_access_token_key
REFRESH_TOKEN_KEY=your_refresh_token_key
ACCESS_TOKEN_AGE=your_access_token_age

# Message broker
RABBITMQ_SERVER=your_rabbitmq_server

# Redis
REDIS_SERVER=your_redis_server
```
