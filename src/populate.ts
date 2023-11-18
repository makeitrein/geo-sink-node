import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { z } from "zod";
import { actionsFromURI, isValidAction } from "./utils/actions.js";
import { pool } from "./utils/pool.js";
import { generateTripleId } from "./utils/triples.js";
import { ZodEntry, ZodUriData, type FullEntry } from "./zod.js";

export const populateEntries = async (
  entries: z.infer<typeof ZodEntry>[],
  blockNumber: number
) => {
  const fullEntries: FullEntry[] = [];
  for (const entry of entries) {
    // First check if the general response conforms to what we expect
    const uriResponse = ZodUriData.safeParse(await actionsFromURI(entry.uri));
    if (uriResponse.success) {
      // Then check if the actions conform to what we expect
      console.log("Original Action Count", uriResponse.data.actions.length);
      const actions = uriResponse.data.actions.filter(isValidAction);
      console.log("Valid Action Count", actions.length);
      fullEntries.push({ ...entry, uriData: { ...uriResponse.data, actions } });
    } else {
      console.error("Failed to parse URI data");
      console.error(uriResponse);
      console.error(uriResponse.error);
    }
  }

  console.log(fullEntries);

  const accounts: s.accounts.Insertable[] = toAccounts(fullEntries);
  await db
    .upsert("accounts", accounts, ["id"], { updateColumns: db.doNothing })
    .run(pool);

  const actions: s.actions.Insertable[] = toActions(fullEntries);
  await db.insert("actions", actions).run(pool);

  const geoEntities: s.geo_entities.Insertable[] = toGeoEntities(fullEntries);
  await db
    .upsert("geo_entities", geoEntities, ["id"], {
      updateColumns: db.doNothing,
    })
    .run(pool);

  const log_entries: s.log_entries.Insertable[] = [];
  const proposals: s.proposals.Insertable[] = [];
  const proposed_versions: s.proposed_versions.Insertable[] = [];
  const space_admins: s.space_admins.Insertable[] = [];
  const space_editor_controllers: s.space_editor_controllers.Insertable[] = [];
  const space_editors: s.space_editors.Insertable[] = [];

  const spaces: s.spaces.Insertable[] = toSpaces(fullEntries, blockNumber);
  await db
    .upsert("spaces", spaces, ["id"], {
      updateColumns: db.doNothing,
    })
    .run(pool);

  const subspaces: s.subspaces.Insertable[] = [];

  /* Todo: How are duplicate triples being handled in Geo? I know it's possible, but if the triple ID is defined, what does that entail */
  const triples: s.triples.Insertable[] = toTriples(fullEntries);
  await db
    .upsert("triples", triples, ["id"], {
      updateColumns: db.doNothing,
    })
    .run(pool);

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
      const string_value =
        action.value.type === "string" ? action.value.value : null;
      const entity_value_id =
        action.value.type === "entity" ? action.value.id : null;
      return {
        action_type: action.type,
        entity_id: action.entityId,
        attribute_id: action.attributeId,
        value_type: action.value.type,
        value_id: action.value.id,
        string_value,
        entity_value_id,
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
      const id = generateTripleId({
        space_id,
        entity_id,
        attribute_id,
        value_id,
      });

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

export const toSubspaces = (fullEntries: FullEntry[]) => {
  /* Todo: Confirm with Goose and Byron where 
  ```
  :subspace {:id "442e1850-9de7-4002-a065-7bc8fcff2514"
                            :name "Subspace"
                            :value-type :relation}
                            ```

                            is coming from...

       Table structure:
       
       ```CREATE TABLE IF NOT EXISTS public.subspaces (
    id text PRIMARY KEY NOT NULL,
    parent_space_id text NOT NULL REFERENCES public.spaces(id),
    child_space_id text NOT NULL REFERENCES public.spaces(id)
);
```
  */
};
