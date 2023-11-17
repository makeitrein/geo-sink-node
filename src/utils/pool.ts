import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// pool.end(() => {});

pool.on("error", (err) => console.error(err)); // don't let a pg restart kill your app
