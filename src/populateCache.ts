import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { genesisStartBlockNum } from "./constants/constants";
import { populateWithFullEntries } from "./populateEntries";
import { handleRoleGranted, handleRoleRevoked } from "./populateRoles";
import { pool } from "./utils/pool";
import { FullEntry, RoleChange, ZodRoleChange } from "./zod";

export const populateFromCache = async () => {
  const cachedEntries = await readCacheEntries();
  const cachedRoles = await readCacheRoles();

  let blockNumber = genesisStartBlockNum;

  for (const cachedEntry of cachedEntries) {
    await populateWithFullEntries({
      fullEntries: cachedEntry.data as any, // TODO: Zod typecheck this JSON
      blockNumber: cachedEntry.block_number,
      timestamp: cachedEntry.timestamp,
      cursor: cachedEntry.cursor,
    });

    blockNumber = cachedEntry.block_number;
  }

  for (const cachedRole of cachedRoles) {
    const roleChange = ZodRoleChange.safeParse({
      role: cachedRole.role,
      space: cachedRole.space,
      account: cachedRole.account,
      sender: cachedRole.sender,
    });

    if (!roleChange.success) {
      console.error("Failed to parse cached role change");
      console.error(roleChange);
      console.error(roleChange.error);
      continue;
    }

    if (cachedRole.type === "GRANTED") {
      await handleRoleGranted({
        roleGranted: roleChange.data,
        blockNumber: cachedRole.created_at_block,
        timestamp: cachedRole.created_at,
        cursor: cachedRole.cursor,
      });
    } else if (cachedRole.type === "REVOKED") {
      await handleRoleRevoked({
        roleRevoked: roleChange.data,
        blockNumber: cachedRole.created_at_block,
        cursor: cachedRole.cursor,
        timestamp: cachedRole.created_at,
      });
    }

    if (cachedRole.created_at_block > blockNumber) {
      blockNumber = cachedRole.created_at_block;
    }
  }
};

export const upsertCachedEntries = async ({
  fullEntries,
  blockNumber,
  cursor,
  timestamp,
}: {
  fullEntries: FullEntry[];
  blockNumber: number;
  cursor: string;
  timestamp: number;
}) => {
  try {
    const cachedEntry: s.cache.entries.Insertable = {
      block_number: blockNumber,
      cursor,
      data: JSON.stringify(fullEntries),
      timestamp,
    };

    await db
      .upsert("cache.entries", cachedEntry, ["cursor"], {
        updateColumns: db.doNothing,
      })
      .run(pool);
  } catch (error) {
    console.error("Error upserting cached entry:", error);
  }
};

export const upsertCachedRoles = async ({
  roleChange,
  blockNumber,
  cursor,
  type,
  timestamp,
}: {
  roleChange: RoleChange;
  timestamp: number;
  blockNumber: number;
  cursor: string;
  type: "GRANTED" | "REVOKED";
}) => {
  try {
    const cachedRole: s.cache.roles.Insertable = {
      created_at: timestamp,
      created_at_block: blockNumber,
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
        [
          "role",
          "account",
          "sender",
          "space",
          "type",
          "created_at_block",
          "cursor",
        ],
        {
          updateColumns: db.doNothing,
        }
      )
      .run(pool);
  } catch (error) {
    console.error("Error upserting cached role:", error);
  }
};

export const readCacheEntries = async () => {
  const cachedEntries = await db
    .select("cache.entries", db.all, { order: { by: "id", direction: "ASC" } })
    .run(pool);

  return cachedEntries;
};

export const readCacheRoles = async () => {
  const cachedEntries = await db
    .select("cache.roles", db.all, { order: { by: "id", direction: "ASC" } })
    .run(pool);

  return cachedEntries;
};
