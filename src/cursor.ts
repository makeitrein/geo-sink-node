import * as db from "zapatos/db";
import { pool } from "./utils/pool";

export const readCursor = async () => db.select("cursors", { id: 0 }).run(pool);
export const writeCursor = async (cursor: string, block_number: number) => {
  await db.update("cursors", { cursor, block_number }, { id: 0 }).run(pool);
};
