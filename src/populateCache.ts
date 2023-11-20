import type * as s from "zapatos/schema";
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
    data: JSON.stringify(fullEntries),
  };
};
