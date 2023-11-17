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
  // entityName: z.string().optional().nullish(),
  value: z
    .object({
      type: z
        .enum(["number", "string", "entity", "image", "date", "url"])
        .nullable(),
      id: z.string().optional(),
      value: z.string().optional(),
    })
    .refine((data) => data.id || data.value, {
      message: "Either id or value must be provided",
    }),
});

export type Action = z.infer<typeof ZodAction>;

export const ZodActionsResponse = z.object({
  type: z.string(),
  version: z.string(),
  actions: z.array(ZodAction),
});
export type ActionsResponse = z.infer<typeof ZodActionsResponse>;

export const ZodEntryWithActionsResponse = ZodEntry.merge(ZodActionsResponse);
export type EntryWithActionsResponse = z.infer<
  typeof ZodEntryWithActionsResponse
>;

export const ZodRoleGranted = z.object({
  id: z.string(),
  role: z.enum(["admin", "member", "moderator"]),
  account: z.string(),
  sender: z.string(),
  space: z.string(),
});
export type RoleGranted = z.infer<typeof ZodRoleGranted>;

export const ZodRoleRevoked = z.object({
  id: z.string(),
  role: z.enum(["admin", "member", "moderator"]),
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
