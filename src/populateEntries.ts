import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { z } from "zod";
import { actionsFromURI } from "./utils/actions";
import { insertChunked, upsertChunked } from "./utils/db";
import { generateTripleId } from "./utils/triples";
import { ZodEntry, type FullEntry } from "./zod";

export const populateEntries = async (
  entries: z.infer<typeof ZodEntry>[],
  blockNumber: number,
  timestamp: number
) => {
  const fullEntries: FullEntry[] = [];
  const uriResponses = await Promise.all(
    entries.map((entry) => actionsFromURI(entry.uri))
  );

  const accounts: s.accounts.Insertable[] = toAccounts(fullEntries);
  console.log("Accounts Count: ", accounts.length);
  await upsertChunked("accounts", accounts, ["id"], {
    updateColumns: db.doNothing,
  });

  const actions: s.actions.Insertable[] = toActions(fullEntries);
  console.log("Actions Count", actions.length);
  await insertChunked("actions", actions);

  const geoEntities: s.geo_entities.Insertable[] = toGeoEntities(fullEntries);
  console.log("Geo Entities Count", geoEntities.length);
  await upsertChunked("geo_entities", geoEntities, ["id"], {
    updateColumns: db.doNothing,
  });

  // const log_entries: s.log_entries.Insertable[] = [];
  const proposals: s.proposals.Insertable[] = toProposals(
    fullEntries,
    blockNumber,
    timestamp
  );
  console.log("Proposals Count", proposals.length);
  await insertChunked("proposals", proposals);
  // const proposed_versions: s.proposed_versions.Insertable[] = [];

  const spaces: s.spaces.Insertable[] = toSpaces(fullEntries, blockNumber);
  console.log("Spaces Count", spaces.length);
  await upsertChunked("spaces", spaces, ["id"], {
    updateColumns: db.doNothing,
  });

  // /* Todo: How are duplicate triples being handled in Geo? I know it's possible, but if the triple ID is defined, what does that entail */
  const triples: s.triples.Insertable[] = toTriples(fullEntries);
  console.log("Triples Count", triples.length);
  upsertChunked("triples", triples, ["id"], {
    updateColumns: db.doNothing,
  });

  // const versions: s.versions.Insertable[] = [];
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
      const entity_value =
        action.value.type === "entity" ? action.value.id : null;
      return {
        action_type: action.type,
        entity_id: action.entityId,
        attribute_id: action.attributeId,
        value_type: action.value.type,
        value_id: action.value.id,
        string_value,
        entity_value,
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

type FullEntry = {
  id: string;
  uri: string;
  index: string;
  author: string;
  space: string;
  uriData: {
    actions: any[];
    type: string;
    version: string;
  };
};

export const toProposals = (
  fullEntries: FullEntry[],
  blockNumber: number,
  timestamp: number
) => {
  const proposals: s.proposals.Insertable[] = fullEntries.flatMap(
    (fullEntry) => ({
      is_root_space: false,
      created_at_block: blockNumber,
      created_by_id: fullEntry.author,
      space_id: fullEntry.space,
      created_at: timestamp,
      status: "APPROVED",
    })
  );

  return proposals;
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
