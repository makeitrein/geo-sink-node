import { z } from "zod";

export const Entry = z.object({
  id: z.string(),
  index: z.string(),
  uri: z.string(),
  author: z.string(),
  space: z.string(),
});

export const RoleGranted = z.object({
  id: z.string(),
  role: z.enum(["admin", "member", "moderator"]),
  account: z.string(),
  sender: z.string(),
  space: z.string(),
});

export const RoleRevoked = z.object({
  id: z.string(),
  role: z.enum(["admin", "member", "moderator"]),
  account: z.string(),
  sender: z.string(),
  space: z.string(),
});

export const EntryStreamResponse = z.object({
  entries: z.array(Entry),
});

export const RoleGrantedStreamResponse = z.object({
  rolesGranted: z.array(RoleGranted),
});

export const RoleRevokedStreamResponse = z.object({
  rolesRevoked: z.array(RoleRevoked),
});
