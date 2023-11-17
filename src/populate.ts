import type * as s from "zapatos/schema";
import { z } from "zod";
import { actionsFromURI } from "./utils/actions.js";
import { ZodEntry, ZodUriData, type FullEntry } from "./zod.js";

export const populateEntries = async (
  entries: z.infer<typeof ZodEntry>[],
  blockNumber: number
) => {
  const fullEntries: FullEntry[] = [];
  for (const entry of entries) {
    const unsafeResponse = await actionsFromURI(entry.uri);
    const response = ZodUriData.safeParse(unsafeResponse);
    if (response.success) {
      fullEntries.push({ ...entry, uriData: response.data });
    } else {
      console.error("Failed to parse URI data");
      console.error(unsafeResponse);
      console.error(response.error);
    }
  }

  console.log(fullEntries);

  const accounts: s.accounts.Insertable[] = [];
  const actions: s.actions.Insertable[] = [];
  const entities: s.geo_entities.Insertable[] = [];
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

export const toAccounts = (fullEntries: FullEntry[]) => {
  const accounts: s.accounts.Insertable[] = [];
  const author = fullEntries[0].author; // TODO: Confirm with Byron that this logic is correct
  if (author) {
    accounts.push({
      id: author,
    });
  }
  return accounts;
};

export const toActions = (fullEntries: FullEntry[]) => {
  const actions: s.actions.Insertable[] = fullEntries.flatMap((fullEntry) => {
    return fullEntry.uriData.actions.map((action) => {
      return {
        action_type: action.type,
        entity_id: action.entityId,
        attribute_id: action.attributeId,
        value_type: action.value.type,
        value_id: action.value.id,
        value_value: action.value.value,
        entity: action.entityId,
      };
    });
  });

  return actions;
};

export const toGeoEntities = (fullEntries: FullEntry[]) => {
  const entities: s.geo_entities.Insertable[] = fullEntries.flatMap(
    (fullEntry) => {
      return fullEntry.uriData.actions.map((action) => {
        return {
          id: action.entityId,
          defined_in_id: fullEntry.space,
        };
      });
    }
  );

  return entities;
};

export const toSpaces = (fullEntries: FullEntry[], blockNumber: number) => {
  const spaces: s.spaces.Insertable[] = fullEntries.flatMap((fullEntry) => ({
    id: fullEntry.space,
    is_root_space: false,
    created_at_block: blockNumber,
  }));

  return spaces;
};

export const toTriples = (fullEntries: FullEntry[]) => {
  const triples: s.triples.Insertable[] = fullEntries.flatMap((fullEntry) => {
    return fullEntry.uriData.actions.map((action) => {
      const action_type = action.type;
      const entity_id = action.entityId;
      const attribute_id = action.attributeId;
      const value_type = action.value.type;
      const value_id = action.value.id;
      const space_id = fullEntry.space;
      const deleted = action_type === "deleteTriple";
      const is_protected = false;
      const id = `${space_id}:${entity_id}:${attribute_id}:${value_id}`;

      const entity_value_id = value_type === "entity" ? value_id : null;
      const string_value = value_type === "string" ? action.value.value : null;

      return {
        id,
        entity_id,
        attribute_id,
        value_id,
        value_type,
        entity_value_id,
        string_value,
        space_id,
        is_protected,
        deleted,
      };
    });
  });

  return triples;
};
