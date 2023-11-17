import type * as s from "zapatos/schema";
import { z } from "zod";
import { actionsFromURI } from "./utils/actions.js";
import {
  ZodActionsResponse,
  ZodEntry,
  type EntryWithActionsResponse,
} from "./zod.js";

export const populateEntries = async (entries: z.infer<typeof ZodEntry>[]) => {
  const geoEntries: EntryWithActionsResponse[] = [];
  for (const entry of entries) {
    const response = ZodActionsResponse.safeParse(
      await actionsFromURI(entry.uri)
    );
    if (response.success) {
      geoEntries.push({ ...entry, ...response.data });
    } else {
      console.error(response.error);
    }
  }

  const accounts: s.accounts.Insertable[] = [];
  const actions: s.actions.Insertable[] = [];
  const entities: s.entities.Insertable[] = [];
  const log_entries: s.log_entries.Insertable[] = [];
  const proposals: s.proposals.Insertable[] = [];
  const proposed_versions: s.proposed_versions.Insertable[] = [];
  const space_admins: s.space_admins.Insertable[] = [];
  const space_editor_controllers: s.space_editor_controllers.Insertable[] = [];
  const space_editors: s.space_editors.Insertable[] = [];
  const spaces: s.spaces.Insertable[] = [];
  const subspaces: s.subspaces.Insertable[] = [];
  const triples: s.triples.Insertable[] = [];
  const versions: s.versions.Insertable[] = [];
};

export const toAccounts = (geoEntries: EntryWithActionsResponse[]) => {
  const accounts: s.accounts.Insertable[] = [];
  const author = geoEntries[0].author; // TODO: Confirm with Byron that this is the correct way to get the author
  if (author) {
    accounts.push({
      id: author,
    });
  }
  return accounts;
};

export const toActions = (geoEntries: EntryWithActionsResponse[]) => {
  const actions: s.accounts.Insertable[] = geoEntries.flatMap((geoEntry) => {
    return geoEntry.actions.map((action) => {
      return {
        type: action.type,
        entity_id: action.entityId,
        attribute_id: action.attributeId,
        entity_name: action.entityName,
        value_type: action.value.type,
        value_id: action.value.id,
        value_value: action.value.value,
      };
    });
  });

  return actions;
};
