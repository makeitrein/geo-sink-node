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
    data: JSON.stringify(fullEntries),
  };

  await db
    .upsert("cache.entries", cachedEntry, ["cursor"], {
      updateColumns: db.doNothing,
    })
    .run(pool);
};

export const populateCachedRoles = async ({
  roleChange,
  blockNumber,
  cursor,
  type,
}: {
  roleChange: RoleChange;
  blockNumber: number;
  cursor: string;
  type: "GRANTED" | "REVOKED";
}) => {
  const cachedRole: s.cache.roles.Insertable = {
    block_number: blockNumber,
    role: roleChange.role,
    space: roleChange.space,
    account: roleChange.account,
    cursor,
    sender: roleChange.sender,
    type,
  };

  await db
    .upsert(
      "cache.roles",
      cachedRole,
      ["role", "account", "sender", "space", "type", "block_number", "cursor"],
      {
        updateColumns: db.doNothing,
      }
    )
    .run(pool);
};
