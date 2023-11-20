import * as db from "zapatos/db";
import type * as s from "zapatos/schema";
import { PERMISSIONED_SPACE_REGISTRY_ADDRESS } from "./constants/systemIds";
import { actionsFromURI, isValidAction } from "./utils/actions";
import { insertChunked, upsertChunked } from "./utils/db";
import {
  generateProposalId,
  generateProposedVersionId,
  generateTripleId,
  generateVersionId,
} from "./utils/id";
import { Entry, ZodUriData, type FullEntry } from "./zod";

interface StreamData {
  entries: Entry[];
  blockNumber: number;
  timestamp: number;
  cursor: string;
}

export const populateEntries = async ({
  entries,
  blockNumber,
  timestamp,
  cursor,
}: StreamData) => {
  const fullEntries: FullEntry[] = [];
  const uriResponses = await Promise.all(
    entries.map((entry) => actionsFromURI(entry.uri))
  );
  for (let i = 0; i < entries.length; i++) {
    console.log("\n\nProcessing entry", i + 1, "of", entries.length, "entries");
    // First check if the general response conforms to what we expect
    const uriResponse = ZodUriData.safeParse(uriResponses[i]);
    if (uriResponse.success) {
      // Then check if the actions conform to what we expect
      console.log("Original Action Count: ", uriResponse.data.actions.length);
      const actions = uriResponse.data.actions.filter(isValidAction);
      console.log("Valid Actions:", actions.length);
      fullEntries.push({
        ...entries[i],
        uriData: { ...uriResponse.data, actions },
      });
    } else {
      console.error("Failed to parse URI data");
      console.error(uriResponse);
      console.error(uriResponse.error);
    }
  }

  const accounts: s.accounts.Insertable[] = toAccounts({ fullEntries });
  console.log("Accounts Count: ", accounts.length);
  await upsertChunked("accounts", accounts, ["id"], {
    updateColumns: db.doNothing,
  });

  const actions: s.actions.Insertable[] = toActions({ fullEntries, cursor });
  console.log("Actions Count", actions.length);
  await insertChunked("actions", actions);

  const geoEntities: s.geo_entities.Insertable[] = toGeoEntities({
    fullEntries,
  });
  console.log("Geo Entities Count", geoEntities.length);
  await upsertChunked("geo_entities", geoEntities, ["id"], {
    updateColumns: db.doNothing,
  });

  const proposals: s.proposals.Insertable[] = toProposals({
    fullEntries,
    blockNumber,
    timestamp,
    cursor,
  });
  console.log("Proposals Count", proposals.length);
  await insertChunked("proposals", proposals);

  const proposed_versions: s.proposed_versions.Insertable[] =
    toProposedVersions({
      fullEntries,
      blockNumber,
      timestamp,
      cursor,
    });
  console.log("Proposed Versions Count", proposed_versions.length);
  await insertChunked("proposed_versions", proposed_versions);

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

  const versions: s.versions.Insertable[] = [];
  console.log("Versions Count", versions.length);
  await insertChunked("versions", versions);
};

interface ToAccountArgs {
  fullEntries: Entry[];
}

export const toAccounts = ({ fullEntries }: ToAccountArgs) => {
  const accounts: s.accounts.Insertable[] = [];
  const author = fullEntries[0].author; // TODO: Confirm with Byron that this logic is correct
  if (author) {
    accounts.push({
      id: author,
    });
  }
  return accounts;
};

interface ToActionArgs {
  fullEntries: FullEntry[];
  cursor: string;
}
export const toActions = ({ fullEntries, cursor }: ToActionArgs) => {
  const actions: s.actions.Insertable[] = fullEntries.flatMap((fullEntry) => {
    return fullEntry.uriData.actions.map((action) => {
      const string_value =
        action.value.type === "string" ? action.value.value : null;
      const entity_value =
        action.value.type === "entity" ? action.value.id : null;

      const proposed_version_id = generateProposedVersionId({
        entityId: action.entityId,
        cursor,
      });

      const version_id = generateVersionId({
        entityId: action.entityId,
        cursor,
      });

      return {
        action_type: action.type,
        entity_id: action.entityId,
        attribute_id: action.attributeId,
        value_type: action.value.type,
        value_id: action.value.id,
        string_value,
        entity_value,
        proposed_version_id,
        version_id,
      };
    });
  });

  return actions;
};

interface toProposalsArgs {
  fullEntries: FullEntry[];
  blockNumber: number;
  timestamp: number;
  cursor: string;
}
export const toProposals = ({
  fullEntries,
  blockNumber,
  timestamp,
  cursor,
}: toProposalsArgs) => {
  const proposals: s.proposals.Insertable[] = fullEntries.flatMap(
    (fullEntry, idx) => ({
      id: generateProposalId({ idx, cursor }),
      is_root_space: fullEntry.space === PERMISSIONED_SPACE_REGISTRY_ADDRESS,
      created_at_block: blockNumber,
      created_by_id: fullEntry.author,
      space_id: fullEntry.space,
      created_at: timestamp,
      status: "APPROVED",
    })
  );

  return proposals;
};

interface toProposedVersionArgs {
  fullEntries: FullEntry[];
  blockNumber: number;
  timestamp: number;
  cursor: string;
}
export const toProposedVersions = ({
  fullEntries,
  blockNumber,
  timestamp,
  cursor,
}: toProposedVersionArgs) => {
  const proposedVersions: s.proposed_versions.Insertable[] =
    fullEntries.flatMap((fullEntry) => {
      const uniqueEntityIds = fullEntry.uriData.actions
        .map((action) => action.entityId)
        .filter((value, index, self) => self.indexOf(value) === index);

      return uniqueEntityIds.map((entityId) => {
        const proposedVersionName = fullEntry.uriData.name;
        return {
          id: generateProposedVersionId({ entityId, cursor }),
          entity_id: entityId,
          created_at_block: blockNumber,
          created_at: timestamp,
          status: "APPROVED",
          name: proposedVersionName ? proposedVersionName : null,
          created_by_id: fullEntry.author,
        };
      });
    });

  return proposedVersions;
};

interface toVersionArgs {
  fullEntries: FullEntry[];
  blockNumber: number;
  timestamp: number;
  cursor: string;
}
export const toVersions = ({
  fullEntries,
  blockNumber,
  timestamp,
  cursor,
}: toVersionArgs) => {
  const versions: s.versions.Insertable[] = fullEntries.flatMap((fullEntry) => {
    const uniqueEntityIds = fullEntry.uriData.actions
      .map((action) => action.entityId)
      .filter((value, index, self) => self.indexOf(value) === index);

    return uniqueEntityIds.map((entityId) => {
      const proposedVersionName = fullEntry.uriData.name;
      return {
        id: generateProposedVersionId({ entityId, cursor }),
        entity_id: entityId,
        created_at_block: blockNumber,
        created_at: timestamp,
        status: "APPROVED",
        name: proposedVersionName ? proposedVersionName : null,
        proposed_version_id: generateProposedVersionId({ entityId, cursor }),
        created_by_id: fullEntry.author,
      };
    });
  });

  return versions;
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
