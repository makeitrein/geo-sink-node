import * as pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => console.error(err)); // don't let a pg restart kill your app
