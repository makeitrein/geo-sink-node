import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { pool } from "./utils/pool";
import { FullEntry, RoleChange } from "./zod";

export const populateCachedEntries = async ({
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

export const populateCachedRolesGranted = async ({
  roleGranted,
  blockNumber,
  cursor,
}: {
  roleGranted: RoleChange;
  blockNumber: number;
  cursor: string;
}) => {
  const cachedRole: s.cache.roles.Insertable = {
    block_number: blockNumber,
    role: roleGranted.role,
    space: roleGranted.space,
    account: roleGranted.account,
    cursor,
    sender: roleGranted.sender,
    type: "GRANTED",
  };

  await db.upsert("cache.entries", cachedRole, ["cursor"]).run(pool);
};
