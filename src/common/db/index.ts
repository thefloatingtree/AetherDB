import { DB } from '../../generated/kysely/types.js'; // this is the Database interface we defined earlier
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { URL } from "url";

const databaseCredentials = new URL(process.env["DATABASE_URL"] ?? "");

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    host: databaseCredentials.hostname,
    port: +databaseCredentials.port,
    user: databaseCredentials.username,
    password: databaseCredentials.password,
    database: databaseCredentials.pathname.replaceAll("/", ""),
    max: 10,
    ssl: true,
  })
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
});