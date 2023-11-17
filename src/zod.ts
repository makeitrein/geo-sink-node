import { z } from "zod";

export const ZodEntry = z.object({
  id: z.string(),
  index: z.string(),
  uri: z.string(),
  author: z.string(),
  space: z.string(),
});
export type Entry = z.infer<typeof ZodEntry>;

export const ZodAction = z.object({
  type: z.enum(["createTriple", "deleteTriple"]),
  entityId: z.string(),
  attributeId: z.string(),
  entityName: z.string().nullish(),
  value: z
    .object({
      type: z.enum(["number", "string", "entity", "image", "date", "url"]),
      id: z.string(),
      value: z.string(), // TODO: Confirm with Byron that both id and value always exist
    })
    .refine((data) => data.id || data.value, {
      message: "Either id or value must be provided",
    }),
});

export type Action = z.infer<typeof ZodAction>;

export const ZodUriData = z.object({
  type: z.string(),
  version: z.string(),
  actions: z.array(ZodAction),
});
export type UriData = z.infer<typeof ZodUriData>;

export const ZodFullEntry = ZodEntry.extend({
  uriData: ZodUriData,
});
export type FullEntry = z.infer<typeof ZodFullEntry>;

export const ZodRoleGranted = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "MEMBER", "MODERATOR"]),
  account: z.string(),
  sender: z.string(),
  space: z.string(),
});
export type RoleGranted = z.infer<typeof ZodRoleGranted>;

export const ZodRoleRevoked = z.object({
  id: z.string(),
  role: z.enum(["ADMIN", "MEMBER", "MODERATOR"]),
  account: z.string(),
  sender: z.string(),
  space: z.string(),
});
export type RoleRevoked = z.infer<typeof ZodRoleRevoked>;

export const ZodEntryStreamResponse = z.object({
  entries: z.array(ZodEntry),
});

export const ZodRoleGrantedStreamResponse = z.object({
  rolesGranted: z.array(ZodRoleGranted),
});

export const ZodRoleRevokedStreamResponse = z.object({
  rolesRevoked: z.array(ZodRoleRevoked),
});
