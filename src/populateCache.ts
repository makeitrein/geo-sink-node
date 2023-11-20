import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { pool } from "./utils/pool";
import { FullEntry } from "./zod";

export const populateEntriesCache = async ({
  fullEntries,
  blockNumber,
  cursor,
}: {
  fullEntries: FullEntry[];
  blockNumber: number;
  cursor: string;
}) => {
  const cachedEntry: s.cache.entries.Insertable = {
    block_number: blockNumber,
    cursor,
    data: fullEntries,
  };

  await db.upsert("cache.entries", cachedEntry, ["cursor"]).run(pool);
};
